"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import SectionLabel from "@/components/ui/SectionLabel";
import { translations } from "@/lib/translations";
import type { ProposalDocCard } from "@/lib/proposals";

/**
 * "Supporting Documents" proposal section — a grid of document cards, each with
 * a title, short description, and a "View Document" button that downloads a
 * gated PDF via onDownload(attachmentId). Used when a proposal's deliverable is
 * a set of documents rather than a single main PDF.
 */
export default function SupportingDocumentsSection({
  number,
  docs,
  onDownload,
  lang,
}: {
  number: string;
  docs: ProposalDocCard[];
  onDownload: (attachmentId?: string) => void;
  lang: "en" | "es";
}) {
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // Reduced-motion guard (WCAG 2.3.3) — kept self-contained (inline check).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".doc-reveal", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="documents"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.documents} />
        {/* Fixed 2-column grid (not auto-fit) so an even count of documents
            reads as a deliberate square — e.g. Fylo's 4 cards form a clean
            2x2 — rather than reflowing to 3+1 on wide viewports. Single
            column on mobile. */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {docs.map((doc, i) => (
            <div
              key={i}
              className="doc-reveal"
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "2px",
                padding: "clamp(1.5rem, 3vw, 2.5rem)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                backgroundColor: "var(--color-bg-primary)",
              }}
            >
              <h3 className="text-heading" style={{ fontSize: "clamp(1.15rem, 2vw, 1.5rem)" }}>
                {doc.title}
              </h3>
              <p
                className="text-body"
                style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, flex: 1 }}
              >
                {doc.description}
              </p>
              <div>
                <button
                  onClick={() => onDownload(doc.attachmentId)}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: "var(--color-accent)",
                    backgroundColor: "transparent",
                    border: "2px solid var(--color-accent)",
                    borderRadius: "2px",
                    padding: "0.9rem 2rem",
                    cursor: "none",
                    transition: "all 0.3s ease",
                    display: "inline-block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-accent)";
                    e.currentTarget.style.color = "var(--color-bg-void)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--color-accent)";
                  }}
                >
                  {t.proposals.viewer.viewDocument} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
