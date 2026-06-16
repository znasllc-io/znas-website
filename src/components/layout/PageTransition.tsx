"use client";

import { useRef, useCallback, useEffect } from "react";
import { gsap } from "@/lib/gsap-config";
import {
  registerTriggerExit,
  setTransitionFlag,
  consumeTransitionFlag,
} from "@/lib/transition-nav";

/**
 * Standalone page transition overlay, mounted once via SiteChrome.
 *
 * - On mount: consumeTransitionFlag() decides whether to play the
 *   panels-split entrance (arriving from an in-app navigation) or keep
 *   the panels hidden. On "/", HomePreloader consults the same flag and
 *   skips itself when the entrance sweep plays — never both.
 * - Exit: registered with the transition-nav singleton; any component
 *   calls navigateWithTransition(href) to sweep panels in, then navigate.
 */
export default function PageTransition() {
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

    setTransitionFlag();

    // Fallback: navigate even if rAF is throttled (background tab) and the
    // sweep can't play — the click must always result in a navigation.
    const fallback = setTimeout(() => {
      window.location.href = href;
    }, 1200);

    const tl = gsap.timeline({
      defaults: { force3D: true },
      onComplete: () => {
        clearTimeout(fallback);
        window.location.href = href;
      },
    });

    // Panels slide in from top and bottom to cover the page
    tl.to(top, { yPercent: 0, duration: 0.5, ease: "power3.inOut" });
    tl.to(bottom, { yPercent: 0, duration: 0.5, ease: "power3.inOut" }, "<");
  }, []);

  // Mount-only: reveal animation if coming from a transition. MUST have []
  // deps — see consumeTransitionFlag(): the read is cached per page load so
  // re-renders can never replay the entrance.
  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;

    if (consumeTransitionFlag()) {
      // Arriving from an in-app navigation (any page, including "/"):
      // panels cover, then split apart.
      gsap.set(top, { yPercent: 0, force3D: true });
      gsap.set(bottom, { yPercent: 0, force3D: true });

      const tl = gsap.timeline({ defaults: { force3D: true } });
      tl.to(top, { yPercent: -100, duration: 0.6, ease: "power3.inOut" });
      tl.to(bottom, { yPercent: 100, duration: 0.6, ease: "power3.inOut" }, "<");

      // rAF-throttle fallback: never leave the panels covering the page.
      const fallback = setTimeout(() => tl.progress(1, false), 1500);
      return () => clearTimeout(fallback);
    } else {
      gsap.set(top, { yPercent: -100 });
      gsap.set(bottom, { yPercent: 100 });
    }
  }, []);

  useEffect(() => {
    registerTriggerExit(triggerExit);
  }, [triggerExit]);

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
