"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";

interface SectionLabelProps {
  number: string;
  label: string;
}

export default function SectionLabel({ number, label }: SectionLabelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      tl.from(numberRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: "power3.out",
      })
        .from(
          labelRef.current,
          {
            opacity: 0,
            x: -10,
            duration: 0.4,
            ease: "power3.out",
          },
          "-=0.1"
        )
        .from(
          ruleRef.current,
          {
            scaleX: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "-=0.2"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex items-center gap-4 mb-16">
      <span
        ref={numberRef}
        className="text-micro"
        style={{ color: "var(--color-accent)" }}
      >
        {number}
      </span>
      <span
        ref={labelRef}
        className="text-micro"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        — {label}
      </span>
      <div
        ref={ruleRef}
        className="flex-1 h-px"
        style={{
          backgroundColor: "var(--color-border)",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}
