"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import type { ProposalMilestone } from "@/lib/proposals";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

interface MilestoneTimelineProps {
  milestones: ProposalMilestone[];
}

const STATUS_STYLES: Record<
  ProposalMilestone["status"],
  { borderColor: string; textColor: string; nodeColor: string }
> = {
  complete: {
    borderColor: "#34D399",
    textColor: "#34D399",
    nodeColor: "#34D399",
  },
  "in-progress": {
    borderColor: "var(--color-accent)",
    textColor: "var(--color-accent)",
    nodeColor: "var(--color-accent)",
  },
  upcoming: {
    borderColor: "var(--color-text-ghost)",
    textColor: "var(--color-text-tertiary)",
    nodeColor: "var(--color-accent)",
  },
};

export default function MilestoneTimeline({
  milestones,
}: MilestoneTimelineProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      if (isMobile) {
        // Mobile: no pin, just fade in cards vertically
        const cards = track.querySelectorAll(".timeline-card-item");
        cards.forEach((card) => {
          gsap.from(card, {
            x: 30,
            opacity: 0,
            duration: 0.7,
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
      const totalScrollWidth = track.scrollWidth - window.innerWidth;

      // Pin the wrapper and scrub the track horizontally
      gsap.to(track, {
        x: -totalScrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 15%",
          end: () => `+=${totalScrollWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Progress line grows horizontally
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 15%",
            end: () => `+=${totalScrollWidth}`,
            scrub: 0.8,
          },
        });
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, [milestones]);

  return (
    <div ref={wrapperRef} style={{ overflow: "hidden" }}>
      {/* Desktop: horizontal scrolling track */}
      <div className="hidden md:block">
        <div
          ref={trackRef}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "2.5rem",
            paddingTop: "3rem",
            paddingBottom: "3rem",
            paddingLeft: "clamp(1.5rem, 4vw, 4rem)",
            paddingRight: "clamp(1.5rem, 4vw, 4rem)",
            width: "fit-content",
            minHeight: "70vh",
            position: "relative",
          }}
        >
          {/* Horizontal progress line */}
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
              height: "2px",
              backgroundColor: "var(--color-accent)",
              zIndex: 1,
            }}
          />

          {milestones.map((ms, i) => {
            const styles = STATUS_STYLES[ms.status];
            return (
              <div
                key={i}
                className="timeline-card-item"
                style={{
                  width: "clamp(340px, 35vw, 480px)",
                  flexShrink: 0,
                  position: "relative",
                  paddingTop: "3rem",
                }}
              >
                {/* Node dot on the progress line */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(2rem - 9px + 3rem)",
                    marginTop: "-3rem",
                    left: "2rem",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: styles.nodeColor,
                    border: `3px solid var(--color-bg-void)`,
                    boxShadow: `0 0 12px ${styles.nodeColor === "var(--color-accent)" ? "var(--color-accent-glow)" : styles.nodeColor + "40"}`,
                    zIndex: 2,
                  }}
                />

                {/* Card */}
                <div
                  style={{
                    padding: "2rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: 0,
                    backgroundColor: "transparent",
                    transition: "border-color 0.3s ease",
                    minHeight: "200px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  {/* Date */}
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--color-accent)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {ms.date}
                  </div>

                  {/* Milestone name */}
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "1rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {ms.milestone}
                  </h3>

                  {/* Description */}
                  {ms.description && (
                    <p
                      className="text-small"
                      style={{
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.7,
                        marginBottom: "1rem",
                      }}
                    >
                      {ms.description}
                    </p>
                  )}

                  {/* Status pill */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: styles.textColor,
                      backgroundColor: "var(--color-bg-surface)",
                      border: `1px solid ${styles.borderColor}`,
                      padding: "0.2rem 0.6rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {t.proposals.timeline.status[ms.status]}
                  </span>
                </div>
              </div>
            );
          })}

          {/* End spacer */}
          <div style={{ width: "clamp(80px, 8vw, 160px)", flexShrink: 0 }} />
        </div>
      </div>

      {/* Mobile: vertical layout */}
      <div className="md:hidden">
        <div className="relative" style={{ paddingLeft: "2.5rem" }}>
          {/* Vertical connecting line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "8px",
              width: "2px",
              backgroundColor: "var(--color-border)",
            }}
          />

          <div className="flex flex-col gap-8">
            {milestones.map((ms, i) => {
              const styles = STATUS_STYLES[ms.status];
              return (
                <div key={i} className="timeline-card-item relative">
                  {/* Node */}
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: styles.nodeColor,
                      border: `3px solid var(--color-bg-void)`,
                      position: "absolute",
                      left: "-2.5rem",
                      top: "0.25rem",
                      transform: "translateX(calc(-50% + 9px))",
                      zIndex: 1,
                    }}
                  />

                  {/* Date */}
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-accent)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {ms.date}
                  </div>

                  {/* Milestone name */}
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.5rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {ms.milestone}
                  </h3>

                  {/* Description */}
                  {ms.description && (
                    <p
                      className="text-small"
                      style={{
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.6,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {ms.description}
                    </p>
                  )}

                  {/* Status */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: styles.textColor,
                      backgroundColor: "var(--color-bg-surface)",
                      border: `1px solid ${styles.borderColor}`,
                      padding: "0.15rem 0.5rem",
                      lineHeight: 1.4,
                      display: "inline-block",
                    }}
                  >
                    {t.proposals.timeline.status[ms.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
