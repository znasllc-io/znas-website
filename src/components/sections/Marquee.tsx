"use client";

import { useEffect, useRef, memo } from "react";
import { gsap } from "@/lib/gsap-config";
import { marqueeText } from "@/data/content";

function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const firstChild = track.children[0] as HTMLElement;
    if (!firstChild) return;

    const repeatWidth = firstChild.offsetWidth;

    const tween = gsap.to(track, {
      x: -repeatWidth,
      duration: 20,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          return parseFloat(String(x)) % repeatWidth;
        }),
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  const repetitions = 6;

  return (
    <section
      style={{
        padding: "clamp(40px, 8vh, 100px) 0",
        overflow: "hidden",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        transition: "border-color 0.4s ease",
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {Array.from({ length: repetitions }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: "clamp(2rem, 5vw, 5rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              paddingRight: "clamp(16px, 2vw, 32px)",
              flexShrink: 0,
            }}
          >
            {marqueeText}
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(Marquee);
