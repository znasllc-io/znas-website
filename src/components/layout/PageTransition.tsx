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
      onComplete: () => {
        window.location.href = href;
      },
    });

    // Panels slide in from top and bottom to cover the page
    tl.to(top, { yPercent: 0, duration: 0.5, ease: "power3.inOut" });
    tl.to(bottom, { yPercent: 0, duration: 0.5, ease: "power3.inOut" }, "<");
  }, []);

  // On mount: reveal animation if coming from a transition
  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;

    const cameFromTransition = sessionStorage.getItem("znas-page-transition");

    if (cameFromTransition) {
      sessionStorage.removeItem("znas-page-transition");

      // Start covering, then split apart
      gsap.set(top, { yPercent: 0 });
      gsap.set(bottom, { yPercent: 0 });

      const tl = gsap.timeline();
      tl.to(top, { yPercent: -100, duration: 0.6, ease: "power3.inOut" });
      tl.to(bottom, { yPercent: 100, duration: 0.6, ease: "power3.inOut" }, "<");
    } else {
      // No transition — panels hidden
      gsap.set(top, { yPercent: -100 });
      gsap.set(bottom, { yPercent: 100 });
    }

    // Expose triggerExit to parent
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
        }}
      />
    </>
  );
}
