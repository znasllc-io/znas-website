"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import type { ProposalRoadmapPhase } from "@/lib/proposals";

interface RoadmapTimelineProps {
  phases: ProposalRoadmapPhase[];
}

export default function RoadmapTimeline({ phases }: RoadmapTimelineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      if (isMobile) {
        // Mobile: simple vertical scroll, no pin
        cardsRef.current.forEach((card) => {
          if (!card) return;
          gsap.from(card, {
            x: 40,
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
        return;
      }

      // Desktop: horizontal scroll driven by vertical scrolling
      // Calculate how far the track needs to scroll horizontally
      const totalScrollWidth = track.scrollWidth - wrapper.clientWidth;

      // Pin the wrapper and scrub the track horizontally
      gsap.to(track, {
        x: -totalScrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          // end: scroll distance = track width so the pacing feels natural
          end: () => `+=${totalScrollWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Progress line — grows horizontally along the track
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `+=${totalScrollWidth}`,
            scrub: 0.8,
          },
        });
      }

      // Cards are visible immediately — no fade effect
    }, wrapperRef);

    return () => ctx.revert();
  }, [phases]);

  return (
    <div ref={wrapperRef} style={{ overflow: "hidden" }}>
      {/* Horizontal track */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "2rem",
          paddingTop: "3rem",
          paddingBottom: "3rem",
          // Make the track wide enough: each card ~380px + gaps
          width: "fit-content",
          minHeight: "60vh",
          position: "relative",
        }}
      >
        {/* Horizontal progress line (behind cards) */}
        <div
          style={{
            position: "absolute",
            top: "2rem",
            left: 0,
            right: 0,
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
        <div
          ref={progressRef}
          style={{
            position: "absolute",
            top: "2rem",
            left: 0,
            width: "0%",
            height: "1px",
            backgroundColor: "var(--color-accent)",
            zIndex: 1,
          }}
        />

        {phases.map((phase, i) => (
          <div
            key={i}
            ref={(el) => { if (el) cardsRef.current[i] = el; }}
            style={{
              width: "clamp(300px, 30vw, 400px)",
              flexShrink: 0,
              position: "relative",
              paddingTop: "2.5rem",
            }}
          >
            {/* Node dot on the progress line */}
            <div
              style={{
                position: "absolute",
                top: "calc(2rem - 6px + 3rem)",
                // Adjust for the paddingTop on the wrapper
                marginTop: "-3rem",
                left: "1.5rem",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--color-accent)",
                border: "2px solid var(--color-bg-void)",
                zIndex: 2,
              }}
            />

            {/* Card */}
            <div
              style={{
                padding: "1.5rem",
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
                  marginBottom: "1rem",
                  lineHeight: 1.6,
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
          </div>
        ))}

        {/* End spacer so the last card is fully visible */}
        <div style={{ width: "clamp(100px, 10vw, 200px)", flexShrink: 0 }} />
      </div>
    </div>
  );
}
