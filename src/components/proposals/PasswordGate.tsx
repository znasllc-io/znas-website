"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap-config";
import type { SafeProposal } from "@/lib/proposals";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

interface PasswordGateProps {
  slug: string;
  clientName: string;
  onSuccess: (proposalData: SafeProposal) => void;
}

export default function PasswordGate({ slug, clientName, onSuccess }: PasswordGateProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const buttonWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Mount animation — staggered reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        logoRef.current,
        { opacity: 0 },
        { opacity: 0.06, duration: 0.6 }
      );

      tl.fromTo(
        headingRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.2"
      );

      tl.fromTo(
        inputWrapRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        "-=0.2"
      );

      tl.fromTo(
        buttonWrapRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        "-=0.2"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRateLimitMsg("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const shakeInput = useCallback(() => {
    if (!inputRef.current) return;
    gsap.to(inputRef.current, {
      keyframes: [
        { x: -10, duration: 0.07 },
        { x: 10, duration: 0.07 },
        { x: -8, duration: 0.07 },
        { x: 8, duration: 0.07 },
        { x: -4, duration: 0.07 },
        { x: 4, duration: 0.07 },
        { x: 0, duration: 0.07 },
      ],
      ease: "power2.out",
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading || countdown > 0) return;

      setError("");
      setRateLimitMsg("");
      setLoading(true);

      try {
        const res = await fetch("/api/proposals/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, password }),
        });

        if (res.ok) {
          const data = await res.json();
          // Server has set the HttpOnly session cookie — we no longer hold
          // the access code anywhere in client memory.

          // Success exit animation, then callback
          gsap.to(containerRef.current, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => onSuccess(data.proposal),
          });
          return;
        }

        if (res.status === 401) {
          setError(t.proposals.gate.invalidKey);
          shakeInput();
          return;
        }

        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          const retryAfter =
            (data as { retryAfter?: number }).retryAfter ?? 60;
          setCountdown(retryAfter);
          setRateLimitMsg(t.proposals.gate.rateLimitMsg(retryAfter));
          return;
        }

        setError(t.proposals.gate.unexpected);
        shakeInput();
      } catch {
        setError(t.proposals.gate.networkError);
        shakeInput();
      } finally {
        setLoading(false);
      }
    },
    [slug, password, loading, countdown, onSuccess, shakeInput]
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-void)",
        zIndex: 50,
      }}
    >
      {/* Owl watermark */}
      <div
        ref={logoRef}
        style={{
          position: "absolute",
          width: "clamp(280px, 35vw, 500px)",
          height: "clamp(280px, 35vw, 500px)",
          backgroundImage: "url(/logo.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Form container */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          width: "100%",
          maxWidth: "480px",
          padding: "0 1.5rem",
        }}
      >
        <div ref={headingRef} style={{ textAlign: "center", opacity: 0 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              margin: "0 0 0.5rem",
            }}
          >
            {clientName}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-tertiary)",
              margin: 0,
            }}
          >
            {t.proposals.gate.enterKey}
          </p>
        </div>

        {/* Input */}
        <div
          ref={inputWrapRef}
          style={{ width: "100%", maxWidth: "420px", opacity: 0 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
            style={{
              width: "100%",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              background: "var(--color-bg-surface)",
              border: `1px solid ${error ? "#F87171" : "var(--color-border)"}`,
              borderRadius: "2px",
              padding: "0.75rem 1rem",
              color: "var(--color-text-primary)",
              textAlign: "center",
              outline: "none",
              transition: "border-color 0.3s ease",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = "var(--color-accent)";
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }
            }}
          />

          {/* Error message */}
          {error && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.04em",
                color: "#F87171",
                textAlign: "center",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}
            >
              {error}
            </p>
          )}

          {/* Rate limit message */}
          {rateLimitMsg && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.04em",
                color: "var(--color-text-tertiary)",
                textAlign: "center",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}
            >
              {rateLimitMsg}
              {countdown > 0 && (
                <span
                  style={{
                    display: "block",
                    marginTop: "0.25rem",
                    color: "var(--color-accent)",
                  }}
                >
                  {countdown}s
                </span>
              )}
            </p>
          )}
        </div>

        {/* Submit button — CTA pattern from Hero */}
        <div
          ref={buttonWrapRef}
          style={{ width: "100%", maxWidth: "420px", opacity: 0 }}
        >
          <button
            type="submit"
            disabled={loading || countdown > 0 || !password.trim()}
            style={{
              width: "100%",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color:
                loading || countdown > 0 || !password.trim()
                  ? "var(--color-text-ghost)"
                  : "var(--color-accent)",
              background: "transparent",
              border: `1px solid ${
                loading || countdown > 0 || !password.trim()
                  ? "var(--color-border)"
                  : "var(--color-accent)"
              }`,
              borderRadius: "2px",
              padding: "0.6rem 1.4rem",
              transition: "all 0.3s ease",
              cursor:
                loading || countdown > 0 || !password.trim()
                  ? "default"
                  : "none",
              opacity:
                loading || countdown > 0 || !password.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (loading || countdown > 0 || !password.trim()) return;
              e.currentTarget.style.backgroundColor = "var(--color-accent)";
              e.currentTarget.style.color = "var(--color-bg-void)";
            }}
            onMouseLeave={(e) => {
              if (loading || countdown > 0 || !password.trim()) return;
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-accent)";
            }}
          >
            {loading ? t.proposals.gate.verifying : t.proposals.gate.access}
          </button>
        </div>
      </form>
    </div>
  );
}
