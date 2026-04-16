"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import type { ProposalRoadmapPhase } from "@/lib/proposals";

interface RoadmapTimelineProps {
  phases: ProposalRoadmapPhase[];
}

export default function RoadmapTimeline({ phases }: RoadmapTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !progressRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      // Progress line — scrubbed to scroll
      gsap.to(progressRef.current, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });

      // Nodes and cards
      phases.forEach((_, i) => {
        const node = nodesRef.current[i];
        const card = cardsRef.current[i];
        if (!node || !card) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });

        tl.to(node, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          onComplete: () => {
            node.classList.add("is-active");
          },
        }).from(
          card,
          {
            x: isMobile ? 30 : i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.2"
        );

        const innerEls = card.querySelectorAll(".card-inner");
        tl.from(
          innerEls,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.4"
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [phases]);

  return (
    <div ref={sectionRef}>
      <div ref={timelineRef} className="relative" style={{ minHeight: "40vh" }}>
        {/* Center line */}
        <div className="timeline-line" />
        <div ref={progressRef} className="timeline-progress" />

        {/* Phases */}
        <div className="flex flex-col gap-24 md:gap-32 py-12">
          {phases.map((phase, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className="relative">
                {/* Node */}
                <div
                  ref={(el) => {
                    if (el) nodesRef.current[i] = el;
                  }}
                  className="timeline-node"
                  style={{ top: "50%", transform: "translate(-50%, -50%) scale(0)" }}
                />

                {/* Card */}
                <div
                  className={`
                    md:w-[calc(50%-3rem)]
                    ${isLeft ? "md:mr-auto" : "md:ml-auto"}
                    ml-10 md:ml-0
                  `}
                >
                  <div
                    ref={(el) => {
                      if (el) cardsRef.current[i] = el;
                    }}
                    className="timeline-card"
                  >
                    {/* Phase label */}
                    <div
                      className="card-inner text-micro mb-2"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {phase.phase}
                    </div>

                    {/* Description */}
                    <p
                      className="card-inner text-small mb-3"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {phase.description}
                    </p>

                    {/* Deliverables */}
                    <div className="card-inner flex flex-col gap-1">
                      {phase.deliverables.map((item, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-2"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-tertiary)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              color: "var(--color-accent)",
                              flexShrink: 0,
                            }}
                          >
                            &middot;
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
