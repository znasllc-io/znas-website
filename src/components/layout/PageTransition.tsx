"use client";

import { useRef, useCallback, useEffect } from "react";
import { gsap } from "@/lib/gsap-config";

/**
 * Standalone page transition overlay.
 *
 * - On mount: checks sessionStorage for transition flag.
 *   If set, panels start covering the page then split apart (reveal).
 *   If not set, panels stay hidden.
 *
 * - exposeRef: parent can grab `triggerExit` via a ref callback
 *   to trigger the exit animation (panels slide in, then navigate).
 */

interface PageTransitionProps {
  onReady?: (triggerExit: (href: string) => void) => void;
}

export default function PageTransition({ onReady }: PageTransitionProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  const triggerExit = useCallback((href: string) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const top = topRef.current;
    const bottom = bottomRef.current;

    if (!top || !bottom) {
      window.location.href = href;
      return;
    }

    sessionStorage.setItem("znas-page-transition", "1");

    const tl = gsap.timeline({
      defaults: { force3D: true },
      onComplete: () => {
        window.location.href = href;
      },
    });

    // Panels slide in from top and bottom to cover the page
    tl.to(top, { yPercent: 0, duration: 0.5, ease: "power3.inOut" });
    tl.to(bottom, { yPercent: 0, duration: 0.5, ease: "power3.inOut" }, "<");
  }, []);

  // Mount-only: reveal animation if coming from a transition.
  //
  // Critical: this effect MUST have [] deps. If it depended on `onReady` or
  // `triggerExit`, any parent re-render that passes a fresh inline callback
  // would re-fire this effect — and on a proposal-list page (which re-sets
  // the "znas-page-transition" sessionStorage flag in its own mount effect
  // so future navigations get the transition) the flag would still be set,
  // causing the reveal animation to replay on every state change. That bug
  // manifested as: clicking a proposal card to expand the inline password
  // form triggers the panels-split animation even though no navigation
  // happens. Keep mount logic isolated from prop deps.
  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;

    const cameFromTransition = sessionStorage.getItem("znas-page-transition");

    if (cameFromTransition) {
      sessionStorage.removeItem("znas-page-transition");

      // On home, the Preloader plays the "welcome back" animation and
      // covers the page while it rebuilds. PageTransition panels stay
      // hidden to avoid double-covering the viewport.
      const isHome =
        typeof window !== "undefined" && window.location.pathname === "/";

      if (isHome) {
        gsap.set(top, { yPercent: -100 });
        gsap.set(bottom, { yPercent: 100 });
      } else {
        // Proposal pages: panels cover, then split apart
        gsap.set(top, { yPercent: 0, force3D: true });
        gsap.set(bottom, { yPercent: 0, force3D: true });

        const tl = gsap.timeline({ defaults: { force3D: true } });
        tl.to(top, { yPercent: -100, duration: 0.6, ease: "power3.inOut" });
        tl.to(bottom, { yPercent: 100, duration: 0.6, ease: "power3.inOut" }, "<");
      }
    } else {
      // No transition — panels hidden
      gsap.set(top, { yPercent: -100 });
      gsap.set(bottom, { yPercent: 100 });
    }
  }, []);

  // Separately: re-register triggerExit with the parent whenever onReady
  // changes. Idempotent — just stores a stable function reference. Safe to
  // re-run on prop changes; cannot trigger animations.
  useEffect(() => {
    onReady?.(triggerExit);
  }, [onReady, triggerExit]);

  return (
    <>
      <div
        ref={topRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "50vh",
          backgroundColor: "var(--color-bg-void)",
          zIndex: 99998,
          pointerEvents: "none",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />
      <div
        ref={bottomRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50vh",
          backgroundColor: "var(--color-bg-void)",
          zIndex: 99998,
          pointerEvents: "none",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />
    </>
  );
}
