"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import { testimonialsContent } from "@/data/content";
import SectionLabel from "@/components/ui/SectionLabel";

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const quotes = testimonialsContent.quotes;

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".reveal-up"), {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });
  }, []);

  useEffect(() => {
    if (!quoteRef.current) return;
    gsap.from(quoteRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [activeIndex]);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + quotes.length) % quotes.length);
  const next = () => setActiveIndex((i) => (i + 1) % quotes.length);

  const quote = quotes[activeIndex];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel
          number={testimonialsContent.number}
          label={testimonialsContent.label}
        />

        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative quote mark */}
          <div
            className="reveal-up select-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(4rem, 6vw, 6rem)",
              lineHeight: 0.6,
              color: "var(--color-text-ghost)",
            }}
          >
            &ldquo;
          </div>

          <div ref={quoteRef} className="mt-4">
            <blockquote
              className="reveal-up"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.25rem, 2vw, 1.875rem)",
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
              }}
            >
              {quote.text}
            </blockquote>

            <p
              className="mt-8 text-micro reveal-up"
              style={{ color: "var(--color-text-tertiary)" }}
              data-code-comment="// via linkedin.Recommend()"
            >
              — {quote.author}, {quote.role}
            </p>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-6 mt-12 reveal-up">
            {/* Prev */}
            <button
              onClick={prev}
              aria-label="Previous quote"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                transition: "border-color 0.3s, color 0.3s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-accent)";
                el.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-border)";
                el.style.color = "var(--color-text-tertiary)";
              }}
            >
              ←
            </button>

            {/* Dots */}
            <div className="flex gap-3">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Quote ${i + 1}`}
                  style={{
                    width: i === activeIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 9999,
                    border: "none",
                    background:
                      i === activeIndex
                        ? "var(--color-accent)"
                        : "var(--color-text-ghost)",
                    transition: "width 0.3s var(--ease-reveal), background-color 0.3s",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={next}
              aria-label="Next quote"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                transition: "border-color 0.3s, color 0.3s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-accent)";
                el.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-border)";
                el.style.color = "var(--color-text-tertiary)";
              }}
            >
              →
            </button>
          </div>

          {/* Counter */}
          <p
            className="mt-4 text-micro reveal-up"
            style={{ color: "var(--color-text-ghost)" }}
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
