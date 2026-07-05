"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "@/lib/gsap-config";

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Touch-first devices get native scrolling: the old width gate
    // (<=768px) let landscape iPhones and iPads run Lenis + a permanent
    // gsap.ticker rAF loop. Pointer type, not width, is what matters.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouchDevice || prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      // Smooth-scroll same-page #hash anchors (e.g. /#contact) through
      // Lenis instead of fighting native jump behavior.
      anchors: true,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const lenisRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisRaf);

    return () => {
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
