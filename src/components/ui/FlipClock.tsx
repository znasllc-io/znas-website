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

  // Split a title into words for word-level wrapping
  const splitWords = (title: string) => title.split(" ");

  const buildDOM = useCallback(
    (title: string) => {
      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";

      const words = splitWords(title);
      words.forEach((word, wi) => {
        // Word wrapper — stays together as a unit, prevents mid-word breaks
        const wordDiv = document.createElement("span");
        wordDiv.className = "flip-clock-word";
        wordDiv.style.display = "inline-block";
        wordDiv.style.whiteSpace = "nowrap";
        wordDiv.style.verticalAlign = "top";

        for (let ci = 0; ci < word.length; ci++) {
          const charSpan = document.createElement("span");
          charSpan.className = "flip-clock-char";
          const inner = document.createElement("span");
          inner.textContent = word[ci];
          charSpan.appendChild(inner);
          wordDiv.appendChild(charSpan);
        }

        container.appendChild(wordDiv);

        // Add a regular breaking space between words (not after last word)
        if (wi < words.length - 1) {
          const space = document.createTextNode(" ");
          container.appendChild(space);
        }
      });
    },
    []
  );

  const flipTo = useCallback(
    (nextIndex: number) => {
      const container = containerRef.current;
      if (!container || isFlippingRef.current) return;

      isFlippingRef.current = true;

      const currentTitle = titles[currentIndexRef.current];
      const nextTitle = titles[nextIndex];

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Simple crossfade
        const tl = gsap.timeline({
          onComplete: () => {
            currentIndexRef.current = nextIndex;
            isFlippingRef.current = false;
          },
        });
        tl.to(container, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => buildDOM(nextTitle),
        });
        tl.to(container, { opacity: 1, duration: 0.3 });
        return;
      }

      // Get all current char spans for the flip-out
      const currentChars = container.querySelectorAll<HTMLSpanElement>(
        ".flip-clock-char > span"
      );

      // Phase 1: Flip out all current characters
      const staggerSec = staggerMs / 1000;
      const outTl = gsap.timeline({
        onComplete: () => {
          // Rebuild DOM with new title
          buildDOM(nextTitle);

          // Phase 2: Flip in new characters
          const newChars = container.querySelectorAll<HTMLSpanElement>(
            ".flip-clock-char > span"
          );

          const inTl = gsap.timeline({
            onComplete: () => {
              currentIndexRef.current = nextIndex;
              isFlippingRef.current = false;
            },
          });

          newChars.forEach((span, i) => {
            gsap.set(span, { rotationX: 90, opacity: 0 });
            inTl.to(
              span,
              {
                rotationX: 0,
                opacity: 1,
                duration: 0.3,
                ease: "power2.out",
              },
              i * staggerSec
            );
          });
        },
      });

      currentChars.forEach((span, i) => {
        outTl.to(
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
    },
    [titles, staggerMs, buildDOM]
  );

  const scheduleNext = useCallback(() => {
    if (delayedCallRef.current) {
      delayedCallRef.current.kill();
      delayedCallRef.current = null;
    }

    delayedCallRef.current = gsap.delayedCall(intervalMs / 1000, () => {
      const nextIndex = (currentIndexRef.current + 1) % titles.length;
      flipTo(nextIndex);

      // Schedule next after flip completes (~1s max)
      const maxChars = Math.max(...titles.map((t) => t.length));
      const flipDuration = 0.55 + (maxChars * staggerMs) / 1000;
      delayedCallRef.current = gsap.delayedCall(flipDuration, () => {
        if (!paused) {
          scheduleNext();
        }
      });
    });
  }, [intervalMs, titles, flipTo, staggerMs, paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Render initial title
    buildDOM(titles[0]);
    currentIndexRef.current = 0;
    isFlippingRef.current = false;

    // Start cycling if not paused
    if (!paused && titles.length > 1) {
      scheduleNext();
    }

    return () => {
      if (delayedCallRef.current) {
        delayedCallRef.current.kill();
        delayedCallRef.current = null;
      }
    };
  }, [titles, paused, buildDOM, scheduleNext]);

  return (
    <span
      ref={containerRef}
      className={className}
      aria-live="polite"
      aria-atomic="true"
    />
  );
}
