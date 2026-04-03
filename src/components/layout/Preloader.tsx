"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPrefersReduced(true);
      onComplete();
      return;
    }

    // Fallback: force-complete if rAF is throttled (background tabs, headless)
    const fallback = setTimeout(() => {
      tl.progress(1, false);
    }, 3500);

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(fallback);
        if (containerRef.current) {
          containerRef.current.style.pointerEvents = "none";
        }
        onComplete();
      },
    });

    const counter = { value: 0 };

    tl.to(lineRef.current, {
      width: "40%",
      duration: 2,
      ease: "power2.inOut",
    })
      .to(
        counter,
        {
          value: 100,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.round(counter.value)
              ).padStart(3, "0");
            }
          },
        },
        0
      )
      .to(topRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power3.inOut",
      })
      .to(
        bottomRef.current,
        {
          yPercent: 100,
          duration: 0.8,
          ease: "power3.inOut",
        },
        "<"
      )
      .to(
        [lineRef.current, counterRef.current],
        {
          opacity: 0,
          duration: 0.3,
        },
        "<"
      );
  }, [onComplete]);

  if (prefersReduced) return null;

  return (
    <div ref={containerRef} className="preloader">
      <div ref={topRef} className="preloader-top" />
      <div ref={bottomRef} className="preloader-bottom" />
      <div
        ref={lineRef}
        className="preloader-line"
        style={{ position: "relative", zIndex: 1 }}
      />
      <span
        ref={counterRef}
        className="preloader-counter"
        style={{ position: "relative", zIndex: 1 }}
      >
        000
      </span>
    </div>
  );
}
