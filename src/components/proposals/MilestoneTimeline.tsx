"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import type { ProposalMilestone } from "@/lib/proposals";

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
    nodeColor: "var(--color-text-ghost)",
  },
};

export default function MilestoneTimeline({
  milestones,
}: MilestoneTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement[]>([]);
  const labelsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const validNodes = nodesRef.current.filter(Boolean);
      const validLabels = labelsRef.current.filter(Boolean);

      gsap.from(validNodes, {
        scale: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(validLabels, {
        y: 15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [milestones]);

  return (
    <div ref={containerRef}>
      {/* Desktop: horizontal layout */}
      <div className="hidden md:block">
        <div className="relative" style={{ paddingTop: "2rem" }}>
          {/* Horizontal connecting line */}
          <div
            className="absolute"
            style={{
              top: "calc(2rem + 5px)",
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "var(--color-border)",
            }}
          />

          <div className="flex justify-between">
            {milestones.map((ms, i) => {
              const styles = STATUS_STYLES[ms.status];
              return (
                <div
                  key={i}
                  className="flex flex-col items-center"
                  style={{
                    flex: 1,
                    position: "relative",
                  }}
                >
                  {/* Node */}
                  <div
                    ref={(el) => {
                      if (el) nodesRef.current[i] = el;
                    }}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: styles.nodeColor,
                      border: `2px solid ${styles.borderColor}`,
                      position: "relative",
                      zIndex: 1,
                      flexShrink: 0,
                    }}
                  />

                  {/* Label group */}
                  <div
                    ref={(el) => {
                      if (el) labelsRef.current[i] = el;
                    }}
                    className="flex flex-col items-center mt-3"
                    style={{ maxWidth: "10rem", textAlign: "center" }}
                  >
                    {/* Date */}
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--color-accent)",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {ms.date}
                    </div>

                    {/* Milestone name */}
                    <div
                      className="text-small"
                      style={{
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {ms.milestone}
                    </div>

                    {/* Status pill */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: styles.textColor,
                        backgroundColor: "var(--color-bg-surface)",
                        border: `1px solid ${styles.borderColor}`,
                        padding: "0.15rem 0.5rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {ms.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: vertical layout */}
      <div className="md:hidden">
        <div className="relative" style={{ paddingLeft: "2rem" }}>
          {/* Vertical connecting line */}
          <div
            className="absolute"
            style={{
              top: 0,
              bottom: 0,
              left: "calc(5px)",
              width: 1,
              backgroundColor: "var(--color-border)",
            }}
          />

          <div className="flex flex-col gap-8">
            {milestones.map((ms, i) => {
              const styles = STATUS_STYLES[ms.status];
              return (
                <div
                  key={i}
                  className="relative flex items-start gap-4"
                >
                  {/* Node */}
                  <div
                    ref={(el) => {
                      // On mobile, append after desktop refs
                      if (el) nodesRef.current[i] = el;
                    }}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: styles.nodeColor,
                      border: `2px solid ${styles.borderColor}`,
                      position: "absolute",
                      left: "-2rem",
                      top: "0.2rem",
                      transform: "translateX(calc(-50% + 5px))",
                      zIndex: 1,
                      flexShrink: 0,
                    }}
                  />

                  {/* Label group */}
                  <div
                    ref={(el) => {
                      if (el) labelsRef.current[i] = el;
                    }}
                  >
                    {/* Date */}
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--color-accent)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {ms.date}
                    </div>

                    {/* Milestone name */}
                    <div
                      className="text-small"
                      style={{
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {ms.milestone}
                    </div>

                    {/* Status pill */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: styles.textColor,
                        backgroundColor: "var(--color-bg-surface)",
                        border: `1px solid ${styles.borderColor}`,
                        padding: "0.15rem 0.5rem",
                        lineHeight: 1.4,
                        display: "inline-block",
                      }}
                    >
                      {ms.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
