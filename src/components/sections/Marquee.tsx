"use client";

import { useEffect, useRef, memo } from "react";
import { gsap } from "@/lib/gsap-config";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

function Marquee() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    // Reduced motion: the static first repetitions read fine as a headline.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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

    // Only run while the marquee is actually on screen — an infinite tween
    // otherwise keeps the main thread + compositor busy for the whole
    // session (measurable battery/jank cost on phones).
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tween.play();
      else tween.pause();
    });
    io.observe(track);

    return () => {
      io.disconnect();
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
            {t.marquee}
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(Marquee);
