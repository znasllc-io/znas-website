"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import type { ProposalTier } from "@/lib/proposals";

interface InvestmentCardsProps {
  description: string;
  tiers: ProposalTier[];
}

export default function InvestmentCards({
  description,
  tiers,
}: InvestmentCardsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });

        // ClipPath reveal -- blueprint unrolls left to right
        tl.fromTo(
          card,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "power2.inOut" }
        );

        // Then draw internal lines
        tl.from(
          card.querySelectorAll(".blueprint-line"),
          {
            scaleX: 0,
            duration: 0.6,
            ease: "power2.inOut",
            stagger: 0.1,
          },
          "-=0.3"
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [tiers]);

  return (
    <div ref={sectionRef}>
      {/* Description */}
      <p
        className="text-body mb-8"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {description}
      </p>

      {/* Tier grid */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          tiers.length === 1
            ? "md:grid-cols-1 max-w-2xl"
            : tiers.length === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
        }`}
      >
        {tiers.map((tier, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            className="blueprint-card group"
            style={{
              position: "relative",
              padding: "2rem",
              border: `1px solid ${
                tier.recommended
                  ? "var(--color-accent)"
                  : "var(--color-border)"
              }`,
              borderRadius: 0,
              backgroundColor: "transparent",
              transition: "border-color 0.4s, box-shadow 0.4s",
              ...(tier.recommended
                ? { boxShadow: "0 0 30px var(--color-accent-glow)" }
                : {}),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tier.recommended
                ? "var(--color-accent)"
                : "var(--color-border)";
            }}
          >
            {/* Corner registration marks */}
            <div className="corner-bl" />
            <div className="corner-br" />

            {/* Blueprint grid background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(var(--color-border) 1px, transparent 1px),
                  linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
                opacity: 0.06,
              }}
            />

            {/* Tier name */}
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                position: "relative",
              }}
            >
              {tier.name}
            </h3>

            {/* Price */}
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                fontWeight: 600,
                color: "var(--color-accent)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginTop: "0.75rem",
                position: "relative",
              }}
            >
              {tier.price}
            </div>

            {/* Divider */}
            <div
              className="blueprint-line"
              style={{
                height: 1,
                backgroundColor: "var(--color-border)",
                marginTop: "1.5rem",
                marginBottom: "1.5rem",
                transformOrigin: "left",
              }}
            />

            {/* Description */}
            <p
              className="text-small"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
                marginBottom: "1.25rem",
                position: "relative",
              }}
            >
              {tier.description}
            </p>

            {/* Divider */}
            <div
              className="blueprint-line"
              style={{
                height: 1,
                backgroundColor: "var(--color-border)",
                marginBottom: "1.25rem",
                transformOrigin: "left",
              }}
            />

            {/* Includes list */}
            <div
              className="flex flex-col gap-2"
              style={{ position: "relative" }}
            >
              {tier.includes.map((item, j) => (
                <div
                  key={j}
                  className="flex items-start gap-2"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  >
                    &rarr;
                  </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Recommended badge */}
            {tier.recommended && (
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  right: "1.5rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-accent)",
                  padding: "0.25rem 0.75rem",
                  transform: "translateY(-50%)",
                }}
              >
                Recommended
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
