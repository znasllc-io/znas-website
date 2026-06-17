"use client";

import { useEffect } from "react";
import { gsap, SplitText } from "@/lib/gsap-config";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Char-compile headline reveal (the portfolio hero's signature, brought to the
 * main site). Splits the target into characters and rises + fades them in when
 * the headline scrolls into view.
 *
 * Gradient-safe: `.fde-gradient-text` paints its gradient via
 * `background-clip: text` on the element. That clip does NOT extend into
 * transformed child spans, so naively splitting a gradient headline makes the
 * chars vanish while they animate. We re-apply the gradient per-character so
 * each glyph carries its own clip and stays visible through the transform.
 *
 * Reduced-motion: no-op (the text stays in its natural, fully-visible state).
 * Re-splits when `deps` change (e.g. the SplitHeadline remounts on language
 * toggle, which is the safe React + SplitText pattern).
 */
export function useSplitReveal(
  ref: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let split: InstanceType<typeof SplitText> | null = null;

    const ctx = gsap.context(() => {
      // "words,chars" (not just "chars") so the line only breaks at spaces —
      // splitting into bare chars lets the browser break mid-word (e.g.
      // "SYS\nTEM"). Words wrap as units; we still animate the individual chars.
      split = SplitText.create(el, { type: "words,chars" });
      const chars = split.chars;

      if (el.classList.contains("fde-gradient-text")) {
        chars.forEach((c) => {
          const s = (c as HTMLElement).style;
          s.backgroundImage = "var(--fde-grad)";
          s.webkitBackgroundClip = "text";
          s.backgroundClip = "text";
          s.color = "transparent";
        });
      }

      gsap.fromTo(
        chars,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.022,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => {
      split?.revert();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Draw-in for hairline dividers (the portfolio's line-draw feel, applied to the
 * main site's gradient `.fde-hairline` dividers). Scales the element in from
 * the left on scroll-into-view. Reduced-motion: no-op.
 */
export function useScaleInX(
  ref: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
