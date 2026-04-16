"use client";

import { useEffect, useRef, memo } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;

    const tween = gsap.to(barRef.current, { scaleX: 1, ease: "none" });
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
      animation: tween,
    });

    return () => { st.kill(); tween.kill(); };
  }, []);

  return (
    <div
      ref={barRef}
      className="scroll-progress"
      style={{ transform: "scaleX(0)" }}
    />
  );
}

export default memo(ScrollProgress);
