"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Navigation from "@/components/layout/Navigation";
import CustomCursor from "@/components/layout/CustomCursor";
import PageTransition from "@/components/layout/PageTransition";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

interface ProposalEntry {
  slug: string;
  clientName: string;
  projectTitle: string;
}

export default function ProposalListClient({
  proposals,
}: {
  proposals: ProposalEntry[];
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerExitRef = useRef<((href: string) => void) | null>(null);

  // Mark that we're on a proposal page so ANY navigation away (including
  // browser back button) triggers the short "welcome back" preloader on
  // the home page. Runs after PageTransition's useEffect consumes any
  // existing flag, so this re-sets it for the next navigation.
  //
  // The unload listener disables bfcache in Chromium browsers, forcing
  // a fresh mount of Home on browser back — so the Preloader's useEffect
  // actually runs and plays the short animation instead of being stuck
  // in a cached pre-animation state.
  useEffect(() => {
    sessionStorage.setItem("znas-page-transition", "1");
    const preventBfcache = () => {};
    window.addEventListener("unload", preventBfcache);
    return () => window.removeEventListener("unload", preventBfcache);
  }, []);

  // Countdown timer for rate limiting
  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRateLimitMsg("");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSlug || loading || countdown > 0) return;

      setError("");
      setRateLimitMsg("");
      setLoading(true);

      // Fetch first — we need to know if auth succeeded before starting the animation
      // (we don't want to animate away on a wrong password)
      try {
        const res = await fetch("/api/proposals/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: selectedSlug, password }),
        });

        if (res.ok) {
          const data = await res.json();
          // Store auth data in sessionStorage
          sessionStorage.setItem(
            `znas-proposal-${selectedSlug}`,
            JSON.stringify({ proposal: data.proposal, password })
          );
          // Navigate — PageTransition handles the animation.
          // IMPORTANT: do NOT call setLoading(false) — we're leaving this page.
          // Any state update during the GSAP animation causes stutter.
          if (triggerExitRef.current) {
            triggerExitRef.current(`/proposals/${selectedSlug}`);
          } else {
            window.location.href = `/proposals/${selectedSlug}`;
          }
          return;
        }

        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          const retryAfter = (data as { retryAfter?: number }).retryAfter ?? 60;
          startCountdown(retryAfter);
          setRateLimitMsg(t.proposals.list.rateLimitMsg(retryAfter));
          setLoading(false);
          return;
        }

        setError(t.proposals.list.invalidKey);
        setLoading(false);
      } catch {
        setError(t.proposals.list.networkError);
        setLoading(false);
      }
    },
    [selectedSlug, password, loading, countdown, startCountdown]
  );

  const handleCancel = () => {
    setSelectedSlug(null);
    setPassword("");
    setError("");
    setRateLimitMsg("");
  };

  return (
    <>
      <CustomCursor />
      <Navigation variant="portal" backHref="/" backLabel={t.nav.back} />
      <PageTransition onReady={(fn) => { triggerExitRef.current = fn; }} />

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--color-bg-void)",
          display: "flex",
          flexDirection: "column",
          paddingTop: "clamp(5rem, 8vh, 7rem)",
        }}
      >
        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 0",
          }}
        >
          <div className="container" style={{ maxWidth: "600px" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h1 className="text-heading" style={{ marginBottom: "0.75rem" }}>
                {t.proposals.list.title}
              </h1>
              <p className="text-small" style={{ color: "var(--color-text-tertiary)" }}>
                {t.proposals.list.subtitle}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {proposals.map((p) => (
                <div key={p.slug}>
                  {/* Card */}
                  <div
                    onClick={() => {
                      if (selectedSlug !== p.slug) {
                        setSelectedSlug(p.slug);
                        setPassword("");
                        setError("");
                        setRateLimitMsg("");
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }
                    }}
                    style={{
                      display: "block",
                      padding: "1.25rem 1.5rem",
                      border: `1px solid ${selectedSlug === p.slug ? "var(--color-accent)" : "var(--color-border)"}`,
                      borderRadius: 0,
                      backgroundColor: selectedSlug === p.slug ? "var(--color-bg-elevated)" : "transparent",
                      transition: "border-color 0.3s, background-color 0.3s",
                      cursor: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSlug !== p.slug) {
                        e.currentTarget.style.borderColor = "var(--color-accent)";
                        e.currentTarget.style.backgroundColor = "var(--color-bg-elevated)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSlug !== p.slug) {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {p.clientName}
                    </div>
                    {selectedSlug !== p.slug && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          letterSpacing: "0.1em",
                          color: "var(--color-text-tertiary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {t.proposals.list.viewProposal}
                      </div>
                    )}
                  </div>

                  {/* Inline code entry */}
                  {selectedSlug === p.slug && (
                    <div
                      style={{
                        padding: "1.25rem 1.5rem",
                        borderLeft: "1px solid var(--color-accent)",
                        borderRight: "1px solid var(--color-accent)",
                        borderBottom: "1px solid var(--color-accent)",
                        backgroundColor: "var(--color-bg-elevated)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--color-text-tertiary)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {t.proposals.list.enterKey}
                      </p>
                      <form onSubmit={handleSubmit}>
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
                            fontSize: "0.8rem",
                            letterSpacing: "0.06em",
                            background: "var(--color-bg-surface)",
                            border: `1px solid ${error ? "#F87171" : "var(--color-border)"}`,
                            borderRadius: "2px",
                            padding: "0.65rem 0.75rem",
                            color: "var(--color-text-primary)",
                            outline: "none",
                            transition: "border-color 0.3s ease",
                            boxSizing: "border-box",
                            marginBottom: "0.75rem",
                          }}
                          onFocus={(e) => {
                            if (!error) e.currentTarget.style.borderColor = "var(--color-accent)";
                          }}
                          onBlur={(e) => {
                            if (!error) e.currentTarget.style.borderColor = "var(--color-border)";
                          }}
                        />

                        {error && (
                          <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "#F87171",
                            marginBottom: "0.5rem",
                          }}>
                            {error}
                          </p>
                        )}
                        {rateLimitMsg && (
                          <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "var(--color-text-tertiary)",
                            marginBottom: "0.5rem",
                          }}>
                            {rateLimitMsg}
                            {countdown > 0 && (
                              <span style={{ color: "var(--color-accent)", marginLeft: "0.5rem" }}>
                                {countdown}s
                              </span>
                            )}
                          </p>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <button
                            type="submit"
                            disabled={loading || countdown > 0 || !password.trim()}
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.7rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: loading || !password.trim() ? "var(--color-text-ghost)" : "var(--color-bg-void)",
                              backgroundColor: loading || !password.trim() ? "transparent" : "var(--color-accent)",
                              border: `1px solid ${loading || !password.trim() ? "var(--color-border)" : "var(--color-accent)"}`,
                              borderRadius: "2px",
                              padding: "0.5rem 1.2rem",
                              cursor: loading || !password.trim() ? "default" : "none",
                              transition: "all 0.3s ease",
                              opacity: loading || !password.trim() ? 0.5 : 1,
                            }}
                          >
                            {loading ? t.proposals.list.verifying : t.proposals.list.access}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.7rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "var(--color-text-tertiary)",
                              backgroundColor: "transparent",
                              border: "1px solid var(--color-border)",
                              borderRadius: "2px",
                              padding: "0.5rem 1.2rem",
                              cursor: "none",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {t.proposals.list.cancel}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}

              {proposals.length === 0 && (
                <p className="text-small" style={{
                  color: "var(--color-text-ghost)",
                  textAlign: "center",
                  padding: "2rem",
                }}>
                  {t.proposals.list.noProposals}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
