"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { aboutIntroContent } from "@/data/content";

export default function AboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!textRef.current || !sectionRef.current) return;

    gsap.from(textRef.current, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === sectionRef.current) t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: "clamp(80px, 15vh, 200px) clamp(24px, 4vw, 80px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <p
          ref={textRef}
          style={{
            fontSize: "clamp(1.5rem, 3.5vw, 3.5rem)",
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
          }}
        >
          {aboutIntroContent.statement}
        </p>
      </div>
    </section>
  );
}
