"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap-config";

interface FlipClockProps {
  titles: string[];
  intervalMs?: number;
  className?: string;
  paused?: boolean;
  staggerMs?: number;
}

export default function FlipClock({
  titles,
  intervalMs = 3500,
  className,
  paused = false,
  staggerMs = 30,
}: FlipClockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const isFlippingRef = useRef(false);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  /**
   * Build DOM for a title using DocumentFragment (single reflow).
   * Returns the inner <span> elements for animation targeting.
   */
  const buildTitle = useCallback(
    (title: string): HTMLSpanElement[] => {
      const container = containerRef.current;
      if (!container) return [];

      const fragment = document.createDocumentFragment();
      const innerSpans: HTMLSpanElement[] = [];
      const words = title.split(" ");

      words.forEach((word, wi) => {
        const wordEl = document.createElement("span");
        wordEl.className = "flip-clock-word";
        wordEl.style.display = "inline-block";
        wordEl.style.whiteSpace = "nowrap";
        wordEl.style.verticalAlign = "baseline";

        for (let ci = 0; ci < word.length; ci++) {
          const charEl = document.createElement("span");
          charEl.className = "flip-clock-char";
          const inner = document.createElement("span");
          inner.textContent = word[ci];
          charEl.appendChild(inner);
          wordEl.appendChild(charEl);
          innerSpans.push(inner);
        }

        fragment.appendChild(wordEl);

        if (wi < words.length - 1) {
          fragment.appendChild(document.createTextNode(" "));
        }
      });

      // Single DOM operation: clear + append
      container.textContent = "";
      container.appendChild(fragment);

      return innerSpans;
    },
    []
  );

  const killScheduled = useCallback(() => {
    if (delayedCallRef.current) {
      delayedCallRef.current.kill();
      delayedCallRef.current = null;
    }
  }, []);

  const killActiveTimeline = useCallback(() => {
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }
  }, []);

  const flipTo = useCallback(
    (nextIndex: number) => {
      const container = containerRef.current;
      if (!container || isFlippingRef.current) return;

      isFlippingRef.current = true;
      killActiveTimeline();

      const nextTitle = titles[nextIndex];
      const staggerSec = staggerMs / 1000;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        const tl = gsap.timeline({
          onComplete: () => {
            currentIndexRef.current = nextIndex;
            isFlippingRef.current = false;
          },
        });
        activeTimelineRef.current = tl;
        tl.to(container, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => { buildTitle(nextTitle); },
        });
        tl.to(container, { opacity: 1, duration: 0.3 });
        return;
      }

      // Get current chars for flip-out
      const currentChars = Array.from(
        container.querySelectorAll<HTMLSpanElement>(".flip-clock-char > span")
      );

      // Single timeline for the full out→rebuild→in sequence
      const tl = gsap.timeline({
        onComplete: () => {
          currentIndexRef.current = nextIndex;
          isFlippingRef.current = false;
          activeTimelineRef.current = null;
        },
      });
      activeTimelineRef.current = tl;

      // Phase 1: Flip out current chars
      currentChars.forEach((span, i) => {
        tl.to(
          span,
          {
            rotationX: -90,
            scaleY: 0.8,
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
          },
          i * staggerSec
        );
      });

      // Phase 2: At the end of flip-out, rebuild DOM and flip in
      const outDuration = currentChars.length * staggerSec + 0.25;
      // Phase 2: Rebuild DOM at end of flip-out, then flip in new chars
      tl.add(() => {
        const newSpans = buildTitle(nextTitle);

        // Set initial state for flip-in
        newSpans.forEach((span) => {
          gsap.set(span, { rotationX: 90, opacity: 0 });
        });

        // Phase 3: Flip in new chars
        newSpans.forEach((span, i) => {
          tl.to(
            span,
            {
              rotationX: 0,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            },
            outDuration + 0.05 + i * staggerSec
          );
        });
      }, outDuration);
    },
    [titles, staggerMs, buildTitle, killActiveTimeline]
  );

  const scheduleNext = useCallback(() => {
    killScheduled();

    delayedCallRef.current = gsap.delayedCall(intervalMs / 1000, () => {
      delayedCallRef.current = null;
      const nextIndex = (currentIndexRef.current + 1) % titles.length;
      flipTo(nextIndex);

      // Schedule next after flip completes
      const maxChars = Math.max(...titles.map((t) => t.length));
      const flipDuration = 0.6 + (maxChars * staggerMs) / 1000;

      delayedCallRef.current = gsap.delayedCall(flipDuration, () => {
        delayedCallRef.current = null;
        if (!paused) scheduleNext();
      });
    });
  }, [intervalMs, titles, flipTo, staggerMs, paused, killScheduled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial render
    buildTitle(titles[0]);
    currentIndexRef.current = 0;
    isFlippingRef.current = false;

    if (!paused && titles.length > 1) {
      scheduleNext();
    }

    return () => {
      killScheduled();
      killActiveTimeline();
    };
  }, [titles, paused, buildTitle, scheduleNext, killScheduled, killActiveTimeline]);

  return (
    <span
      ref={containerRef}
      className={className}
      aria-live="polite"
      aria-atomic="true"
    />
  );
}
