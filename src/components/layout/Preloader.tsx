"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
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

    // Logo + glow fade in first
    tl.fromTo(logoRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
    )
      .fromTo(glowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "sine.inOut" },
        "-=0.4"
      )
      // Bar loads beneath the logo
      .to(lineRef.current, {
        width: "40%",
        duration: 1.6,
        ease: "power2.inOut",
      }, "-=0.2")
      .to(
        counter,
        {
          value: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.round(counter.value)
              ).padStart(3, "0");
            }
          },
        },
        "<"
      )
      // Everything fades out, panels split
      .to(
        [logoRef.current, glowRef.current, lineRef.current, counterRef.current],
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        }
      )
      .to(topRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power3.inOut",
      }, "-=0.1")
      .to(
        bottomRef.current,
        {
          yPercent: 100,
          duration: 0.8,
          ease: "power3.inOut",
        },
        "<"
      );
  }, [onComplete]);

  if (prefersReduced) return null;

  return (
    <div ref={containerRef} className="preloader">
      <div ref={topRef} className="preloader-top" />
      <div ref={bottomRef} className="preloader-bottom" />
      {/* Logo + glow */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
            filter: "blur(40px)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        <img
          ref={logoRef}
          src="/logo.png"
          alt=""
          className="logo-img"
          style={{ height: "120px", width: "auto", opacity: 0, marginBottom: "2rem" }}
        />
      </div>
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
