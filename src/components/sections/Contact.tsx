"use client";

import { useEffect, useRef, memo } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { contactContent, siteConfig, cyclingTitles } from "@/data/content";
import FlipClock from "@/components/ui/FlipClock";
import SectionLabel from "@/components/ui/SectionLabel";

function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".reveal-up", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel
          number={contactContent.number}
          label={contactContent.label}
        />

        <div className="max-w-3xl">
          <h2
            className="text-display reveal-up"
          >
            {contactContent.headline.map((line, i) => (
              <span key={i} className="block">
                <span data-code-comment={i === 0 ? "// go build -o partnership" : undefined}>
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <a
            href={`mailto:${contactContent.email}`}
            className="inline-block mt-12 reveal-up"
            data-code-comment="// net.Dial(tcp, partner)"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
              color: "var(--color-accent)",
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "letter-spacing 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.letterSpacing = "0.15em";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.letterSpacing = "0.02em";
            }}
          >
            {contactContent.email}
          </a>

          <div className="mt-6 reveal-up" style={{ overflow: "hidden" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.65rem, 1.5vw, 1rem)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
              }}
            >
              Freelance{" "}
            </span>
            <FlipClock
              titles={cyclingTitles}
              className="flip-clock-contact"
              intervalMs={4000}
            />
          </div>

          <div className="flex gap-4 mt-10 reveal-up">
            {contactContent.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center transition-all duration-300"
                style={{
                  height: 48,
                  padding: "0 1.25rem",
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "var(--color-accent)";
                  el.style.color = "var(--color-accent)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "var(--color-border)";
                  el.style.color = "var(--color-text-secondary)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-24 pt-8 flex items-center justify-between reveal-up"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <div className="flex flex-col gap-1">
            <img
              src="/logo.png"
              alt=""
              className="logo-img"
              style={{ height: "48px", width: "auto", opacity: 0.9, objectFit: "contain", flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
              }}
            >
              {siteConfig.name} LLC
            </span>
          </div>
          <span
            className="text-micro"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-tertiary)",
            }}
          >
            © 2026
          </span>
        </div>
      </div>
    </section>
  );
}

export default memo(Contact);
