"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import type { SafeProposal } from "@/lib/proposals";
import SectionLabel from "@/components/ui/SectionLabel";
import RoadmapTimeline from "./RoadmapTimeline";
import InvestmentCards from "./InvestmentCards";
import MilestoneTimeline from "./MilestoneTimeline";

interface ProposalViewerProps {
  proposal: SafeProposal;
  onDownload: () => void;
}

export default function ProposalViewer({
  proposal,
  onDownload,
}: ProposalViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Entrance animation for the header area
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current!.querySelectorAll(".reveal-up"), {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  const { sections } = proposal;

  return (
    <div ref={containerRef}>
      {/* ── Header ── */}
      <section
        ref={headerRef}
        className="section-padding"
        style={{
          backgroundColor: "var(--color-bg-void)",
          paddingTop: "clamp(8rem, 16vh, 14rem)",
        }}
      >
        <div className="container">
          <div className="reveal-up">
            <span
              className="text-micro"
              style={{ color: "var(--color-accent)", marginBottom: "1rem", display: "block" }}
            >
              Proposal
            </span>
          </div>
          <h1
            className="text-display reveal-up"
            style={{ maxWidth: "900px" }}
          >
            {proposal.projectTitle}
          </h1>
          <p
            className="reveal-up"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              color: "var(--color-text-tertiary)",
              marginTop: "1.5rem",
            }}
          >
            Prepared for {proposal.clientName}
          </p>
        </div>
      </section>

      {/* ── Summary ── */}
      <SummarySection
        headline={sections.summary.headline}
        body={sections.summary.body}
        highlights={sections.summary.highlights}
      />

      {/* ── Roadmap ── */}
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--color-bg-void)" }}
      >
        <div className="container">
          <SectionLabel number=".02" label="Roadmap" />
          <RoadmapTimeline phases={sections.roadmap} />
        </div>
      </section>

      {/* ── Timeline ── */}
      <section
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div className="container" style={{ paddingTop: "clamp(6rem, 12vh, 12rem)" }}>
          <SectionLabel number=".03" label="Timeline" />
        </div>
        <MilestoneTimeline milestones={sections.timeline} />
      </section>

      {/* ── Investment ── */}
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--color-bg-void)" }}
      >
        <div className="container">
          <SectionLabel number=".04" label="Investment" />
          <InvestmentCards
            description={sections.investment.description}
            tiers={sections.investment.tiers}
          />
        </div>
      </section>

      {/* ── Download CTA ── */}
      <DownloadSection onDownload={onDownload} />

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: "var(--color-bg-primary)",
          borderTop: "1px solid var(--color-border)",
          padding: "2rem 0",
        }}
      >
        <div className="container flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <img
              src="/logo.png"
              alt=""
              className="logo-img"
              style={{
                height: "48px",
                width: "auto",
                opacity: 0.9,
                objectFit: "contain",
                flexShrink: 0,
              }}
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
              ZNAS LLC
            </span>
          </div>
          <span
            className="text-micro"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-tertiary)",
            }}
          >
            Confidential
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ── Summary Sub-component ── */
function SummarySection({
  headline,
  body,
  highlights,
}: {
  headline: string;
  body: string;
  highlights: string[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".summary-reveal", {
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
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number=".01" label="Executive Summary" />

        <h2
          className="text-heading summary-reveal"
          style={{ maxWidth: "800px", marginBottom: "2rem" }}
        >
          {headline}
        </h2>

        <div
          className="summary-reveal"
          style={{
            maxWidth: "800px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.8,
          }}
        >
          {body.split("\n\n").map((para, i) => (
            <p key={i} className="text-body" style={{ marginBottom: "1.5rem" }}>
              {para}
            </p>
          ))}
        </div>

        {/* Highlights grid */}
        <div
          className="summary-reveal grid grid-cols-1 md:grid-cols-2 gap-4 mt-12"
          style={{ maxWidth: "900px" }}
        >
          {highlights.map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "1rem",
                border: "1px solid var(--color-border)",
                borderRadius: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--color-accent)",
                  flexShrink: 0,
                  marginTop: "0.15rem",
                }}
              >
                →
              </span>
              <span
                className="text-small"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {h}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Download Sub-component ── */
function DownloadSection({ onDownload }: { onDownload: () => void }) {
  return (
    <section
      className="section-padding"
      style={{
        backgroundColor: "var(--color-bg-primary)",
        textAlign: "center",
      }}
    >
      <div className="container">
        <h2 className="text-heading" style={{ marginBottom: "1rem" }}>
          Ready to move forward?
        </h2>
        <p
          className="text-body"
          style={{
            color: "var(--color-text-secondary)",
            maxWidth: "500px",
            margin: "0 auto 3rem",
          }}
        >
          Download the full proposal document for your records.
        </p>
        <button
          onClick={onDownload}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "var(--color-bg-void)",
            backgroundColor: "var(--color-accent)",
            border: "2px solid var(--color-accent)",
            borderRadius: "2px",
            padding: "1.1rem 3rem",
            cursor: "none",
            transition: "all 0.3s ease",
            display: "inline-block",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-accent)";
            e.currentTarget.style.color = "var(--color-bg-void)";
          }}
        >
          Download Full Proposal
        </button>
      </div>
    </section>
  );
}
