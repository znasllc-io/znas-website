"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import { consumeTransitionFlag } from "@/lib/transition-nav";

// Module-level flag: resets on every full page load (hard refresh / direct
// visit), but persists while the SPA stays alive. So the loader plays on
// every real load of the site and is skipped only on client-side navigation
// back to the homepage (no annoying replay mid-session).
let hasPlayedThisLoad = false;

/**
 * Loading screen for the main site, in the FDE design language: owl mark,
 * ZNAS LLC lockup, cyan→blue progress bar with counter, panels splitting
 * away. Plays on every full page load; skipped on in-app navigation back
 * to the homepage.
 */
export default function HomePreloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  // Render nothing until the mount effect decides — avoids a flash of the
  // overlay on visits that skip the animation.
  const [shouldPlay, setShouldPlay] = useState<boolean | null>(null);

  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (
      hasPlayedThisLoad ||
      // Arriving via an in-app transition: PageTransition plays the
      // entrance sweep instead — never stack both covers.
      consumeTransitionFlag() ||
      // Browser back/forward to home: the user has already seen the site
      // this session — don't make them sit through the loader again.
      navEntry?.type === "back_forward" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShouldPlay(false);
      return;
    }
    setShouldPlay(true);
  }, []);

  useEffect(() => {
    if (!shouldPlay) return;

    // Claim the per-load flag here (playback actually starting), not in the
    // decision effect above: under React Strict Mode's dev double-invoke the
    // decision effect runs twice, and claiming there made the second pass
    // skip the preloader entirely — dev never matched prod.
    hasPlayedThisLoad = true;

    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) containerRef.current.style.display = "none";
      },
    });

    // Fallback: force-complete if rAF is throttled (background tab)
    const fallback = setTimeout(() => tl.progress(1, false), 3000);

    const counter = { value: 0 };

    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
    )
      .fromTo(
        textRef.current,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo(
        glowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "sine.inOut" },
        "-=0.4"
      )
      .to(
        lineRef.current,
        { width: "min(40vw, 320px)", duration: 0.9, ease: "power2.inOut" },
        "-=0.2"
      )
      .to(
        counter,
        {
          value: 100,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(counter.value)).padStart(3, "0");
            }
          },
        },
        "<"
      )
      .to(
        [logoRef.current, textRef.current, glowRef.current, lineRef.current, counterRef.current],
        { opacity: 0, duration: 0.3, ease: "power2.in" }
      )
      .set(containerRef.current, { pointerEvents: "none" })
      .to(topRef.current, { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, "-=0.05")
      .to(bottomRef.current, { yPercent: 100, duration: 0.55, ease: "power3.inOut" }, "<");

    return () => {
      clearTimeout(fallback);
      tl.kill();
    };
  }, [shouldPlay]);

  // bfcache safety: if the page is restored from back/forward cache while this
  // fixed, full-screen overlay is still covering (e.g. you navigated away
  // before the preloader finished), hide it on restore — same bug class as the
  // page-transition panels. Without this it could be frozen covering on Back.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && containerRef.current) {
        containerRef.current.style.display = "none";
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  if (!shouldPlay) return null;

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: "50.5%",
    background: "#000",
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div ref={topRef} style={{ ...panelStyle, top: 0 }} />
      <div ref={bottomRef} style={{ ...panelStyle, bottom: 0 }} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // Soft gradient only — no filter:blur. A blurred layer here made
            // iOS Safari composite an extra GPU buffer during first paint,
            // exactly when the phone is busiest; the gradient alone reads
            // identically.
            background:
              "radial-gradient(circle, rgba(46, 134, 247, 0.2) 0%, rgba(46, 134, 247, 0.08) 45%, transparent 72%)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        <img
          ref={logoRef}
          src="/logo.png"
          alt=""
          style={{ height: "120px", width: "auto", opacity: 0, marginBottom: "0.9rem" }}
        />
        <span
          ref={textRef}
          style={{
            fontFamily: '"General Sans", sans-serif',
            fontSize: "0.85rem",
            letterSpacing: "0.45em",
            marginLeft: "0.45em",
            textTransform: "uppercase",
            color: "#f5f6f8",
            opacity: 0,
            marginBottom: "2rem",
          }}
        >
          ZNAS LLC
        </span>
      </div>

      <div
        ref={lineRef}
        style={{
          position: "relative",
          zIndex: 1,
          width: 0,
          height: "2px",
          background: "linear-gradient(90deg, #5bc9de 0%, #2e86f7 100%)",
          boxShadow: "0 0 12px rgba(46, 134, 247, 0.6)",
        }}
      />
      <span
        ref={counterRef}
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "1rem",
          fontFamily: '"General Sans", sans-serif',
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          color: "#6b7280",
        }}
      >
        000
      </span>
    </div>
  );
}
