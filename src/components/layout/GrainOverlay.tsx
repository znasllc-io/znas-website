"use client";

import { useEffect, useRef, memo } from "react";
import { gsap } from "@/lib/gsap-config";

function GrainOverlay() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!ref.current) return;

    const tween = gsap.to(ref.current, {
      x: "random(-100, 100)",
      y: "random(-100, 100)",
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "none",
    });
    return () => { tween.kill(); };
  }, []);

  return (
    <svg ref={ref} className="grain-overlay" aria-hidden="true">
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

export default memo(GrainOverlay);
