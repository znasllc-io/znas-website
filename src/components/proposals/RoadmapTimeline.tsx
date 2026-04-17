"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import type { ProposalRoadmapPhase } from "@/lib/proposals";

interface RoadmapTimelineProps {
  phases: ProposalRoadmapPhase[];
}

export default function RoadmapTimeline({ phases }: RoadmapTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [phases]);

  return (
    <div ref={sectionRef} className="flex flex-col gap-6">
      {phases.map((phase, i) => (
        <div
          key={i}
          ref={(el) => { if (el) cardsRef.current[i] = el; }}
          style={{
            padding: "1.75rem",
            border: "1px solid var(--color-border)",
            borderRadius: 0,
            backgroundColor: "transparent",
            transition: "border-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          {/* Phase label */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: "0.75rem",
            }}
          >
            {phase.phase}
          </div>

          {/* Description */}
          <p
            className="text-small"
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1.25rem",
              lineHeight: 1.7,
            }}
          >
            {phase.description}
          </p>

          {/* Deliverables */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {phase.deliverables.map((item, j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--color-text-tertiary)",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: "var(--color-accent)",
                    flexShrink: 0,
                    fontSize: "0.65rem",
                    marginTop: "0.1rem",
                  }}
                >
                  →
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
