"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import type { SafeProposal, ProposalAttachment } from "@/lib/proposals";
import SectionLabel from "@/components/ui/SectionLabel";
import RoadmapTimeline from "./RoadmapTimeline";
import InvestmentCards from "./InvestmentCards";
import MilestoneTimeline from "./MilestoneTimeline";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

interface ProposalViewerProps {
  proposal: SafeProposal;
  // attachmentId is undefined for the main PDF, or matches an entry in
  // proposal.attachments for a supplementary download.
  onDownload: (attachmentId?: string) => void;
}

export default function ProposalViewer({
  proposal,
  onDownload,
}: ProposalViewerProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
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

  const sections = (lang === "es" && proposal.sections_es) ? proposal.sections_es : proposal.sections;
  const projectTitle = (lang === "es" && proposal.projectTitle_es) ? proposal.projectTitle_es : proposal.projectTitle;

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
              {t.proposals.viewer.label}
            </span>
          </div>
          <h1
            className="text-display reveal-up"
            style={{ maxWidth: "900px" }}
          >
            {projectTitle}
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
            {t.proposals.viewer.preparedFor} {proposal.clientName}
          </p>
        </div>
      </section>

      {/* Sections render in canonical order. Numbering is computed by
          which sections are actually present on this proposal — so Haven
          (Summary, HowItWorks, Team, Initiative) gets .01–.04, while
          Alebrije (Summary, Roadmap, Timeline, Investment) also gets
          .01–.04 the way it always did. The `nextNumber()` helper below
          increments only when the conditional renders, because React
          short-circuits `cond && <Component prop={fn()} />` before
          evaluating the JSX expression.
       */}
      {(() => {
        let n = 1;
        const nextNumber = () => `.${String(n++).padStart(2, "0")}`;
        return (
          <>
            <SummarySection
              number={nextNumber()}
              headline={sections.summary.headline}
              body={sections.summary.body}
              highlights={sections.summary.highlights}
            />

            {sections.roadmap && (
              <RoadmapSection
                number={nextNumber()}
                phases={sections.roadmap}
              />
            )}

            {sections.howItWorks && (
              <HowItWorksSection
                number={nextNumber()}
                intro={sections.howItWorks.intro}
                cards={sections.howItWorks.cards}
              />
            )}

            {sections.timeline && (
              <TimelineSection
                number={nextNumber()}
                milestones={sections.timeline}
              />
            )}

            {sections.investment && (
              <InvestmentSection
                number={nextNumber()}
                description={sections.investment.description}
                tiers={sections.investment.tiers}
              />
            )}

            {sections.team && (
              <TeamSection
                number={nextNumber()}
                name={sections.team.name}
                tagline={sections.team.tagline}
                caption={sections.team.caption}
                photo={sections.team.photo}
              />
            )}

            {sections.initiative && (
              <InitiativeSection
                number={nextNumber()}
                headline={sections.initiative.headline}
                body={sections.initiative.body}
                attachmentId={sections.initiative.attachmentId}
                attachments={proposal.attachments}
                onDownload={onDownload}
                lang={lang}
              />
            )}
          </>
        );
      })()}

      {/* ── Closing note (optional) ── */}
      {proposal.closingNote && <ClosingNote text={proposal.closingNote} />}

      {/* ── Download CTA ── */}
      <DownloadSection
        onDownload={onDownload}
        attachments={
          // Hide attachments already surfaced in the Initiative section so
          // the same gameplan/document doesn't get a button in two places.
          sections.initiative?.attachmentId
            ? proposal.attachments?.filter(
                (a) => a.id !== sections.initiative!.attachmentId
              )
            : proposal.attachments
        }
        cta={proposal.downloadCta}
      />
    </div>
  );
}

/* ── Summary Sub-component ── */
function SummarySection({
  number,
  headline,
  body,
  highlights,
}: {
  number: string;
  headline: string;
  body: string;
  // Optional: lean proposals can omit the highlights grid entirely.
  highlights?: string[];
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
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
      id="summary"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.executiveSummary} />

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

        {/* Highlights grid (optional). Lean proposals omit this entirely. */}
        {highlights && highlights.length > 0 && (
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
        )}
      </div>
    </section>
  );
}

/* ── Roadmap Sub-component ── */
function RoadmapSection({
  number,
  phases,
}: {
  number: string;
  phases: NonNullable<SafeProposal["sections"]["roadmap"]>;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  return (
    <section
      id="roadmap"
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.roadmap} />
        <RoadmapTimeline phases={phases} />
      </div>
    </section>
  );
}

/* ── How It Works Sub-component ── */
function HowItWorksSection({
  number,
  intro,
  cards,
}: {
  number: string;
  intro: string;
  cards: { title: string; body: string }[];
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".how-reveal", {
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
      id="howItWorks"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.howItWorks} />

        <p
          className="text-body how-reveal"
          style={{
            maxWidth: "800px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            marginBottom: "3rem",
          }}
        >
          {intro}
        </p>

        <div
          className="how-reveal grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ maxWidth: "900px" }}
        >
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "1.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: 0,
                backgroundColor: "var(--color-bg-elevated)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  marginBottom: "0.5rem",
                  color: "var(--color-text-primary)",
                }}
              >
                {c.title}
              </h3>
              <p
                className="text-small"
                style={{
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Timeline Sub-component ── */
function TimelineSection({
  number,
  milestones,
}: {
  number: string;
  milestones: NonNullable<SafeProposal["sections"]["timeline"]>;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  return (
    <section
      id="timeline"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container" style={{ paddingTop: "clamp(6rem, 12vh, 12rem)" }}>
        <SectionLabel number={number} label={t.proposals.viewer.sections.timeline} />
      </div>
      <MilestoneTimeline milestones={milestones} />
    </section>
  );
}

/* ── Investment Sub-component ── */
function InvestmentSection({
  number,
  description,
  tiers,
}: {
  number: string;
  description: string;
  tiers: NonNullable<SafeProposal["sections"]["investment"]>["tiers"];
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  return (
    <section
      id="investment"
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.investment} />
        <InvestmentCards description={description} tiers={tiers} />
      </div>
    </section>
  );
}

/* ── Team Sub-component ── */
function TeamSection({
  number,
  name,
  tagline,
  caption,
  photo,
}: {
  number: string;
  name: string;
  tagline: string;
  caption: string;
  photo?: string;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".team-reveal", {
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
      id="team"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.team} />

        <div
          className="team-reveal"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "flex-start",
            maxWidth: "900px",
          }}
        >
          {photo && (
            <div
              style={{
                width: "clamp(120px, 20vw, 180px)",
                height: "clamp(120px, 20vw, 180px)",
                flexShrink: 0,
                border: "1px solid var(--color-border)",
                borderRadius: 0,
                overflow: "hidden",
                backgroundColor: "var(--color-bg-elevated)",
              }}
            >
              {/* Plain <img> — placeholder is an SVG, swappable later. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          <div style={{ flex: 1, minWidth: "260px" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                marginBottom: "0.75rem",
                color: "var(--color-text-primary)",
              }}
            >
              {name}
            </h3>
            <p
              className="text-body"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              {tagline}
            </p>
            <p
              className="text-small"
              style={{
                color: "var(--color-text-tertiary)",
                lineHeight: 1.6,
              }}
            >
              {caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Closing Note Sub-component ── */
// Quiet single-line note above the bottom Download CTA. Used to surface
// pricing or terms reassurance without a card or badge.
function ClosingNote({ text }: { text: string }) {
  return (
    <section
      style={{
        backgroundColor: "var(--color-bg-primary)",
        textAlign: "center",
        padding: "clamp(2rem, 4vh, 3rem) 0 0",
      }}
    >
      <div className="container">
        <p
          className="text-small"
          style={{
            color: "var(--color-text-tertiary)",
            maxWidth: "640px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {text}
        </p>
      </div>
    </section>
  );
}

/* ── Initiative Sub-component ── */
function InitiativeSection({
  number,
  headline,
  body,
  attachmentId,
  attachments,
  onDownload,
  lang,
}: {
  number: string;
  headline: string;
  body: string;
  attachmentId?: string;
  attachments?: ProposalAttachment[];
  onDownload: (attachmentId?: string) => void;
  lang: "en" | "es";
}) {
  const { lang: _l } = useLanguage();
  const t = translations[_l];
  const sectionRef = useRef<HTMLElement>(null);

  // Resolve the referenced attachment so the inline button can show the
  // right label. If the lookup fails, the button is omitted (the section
  // still renders its narrative).
  const attachment = attachmentId
    ? attachments?.find((a) => a.id === attachmentId)
    : undefined;
  const buttonLabel = attachment
    ? lang === "es" && attachment.label_es
      ? attachment.label_es
      : attachment.label
    : null;

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".initiative-reveal", {
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
      id="initiative"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.initiative} />

        <h2
          className="text-heading initiative-reveal"
          style={{ maxWidth: "800px", marginBottom: "2rem" }}
        >
          {headline}
        </h2>

        <div
          className="initiative-reveal"
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

        {attachment && buttonLabel && (
          <div className="initiative-reveal" style={{ marginTop: "2.5rem" }}>
            <DownloadButton
              label={buttonLabel}
              variant="secondary"
              onClick={() => onDownload(attachment.id)}
            />
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Download Sub-component ── */
function DownloadSection({
  onDownload,
  attachments,
  cta,
}: {
  onDownload: (attachmentId?: string) => void;
  attachments?: ProposalAttachment[];
  // Optional per-proposal overrides for the closing copy. Falls back to
  // the global translation strings when absent (or per-field).
  cta?: { headline?: string; subtitle?: string };
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const headline = cta?.headline ?? t.proposals.viewer.download.headline;
  const subtitle = cta?.subtitle ?? t.proposals.viewer.download.subtitle;
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
          {headline}
        </h2>
        <p
          className="text-body"
          style={{
            color: "var(--color-text-secondary)",
            maxWidth: "500px",
            margin: "0 auto 3rem",
          }}
        >
          {subtitle}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {/* Primary: main proposal PDF */}
          <DownloadButton
            label={t.proposals.viewer.download.button}
            variant="primary"
            onClick={() => onDownload()}
          />
          {/* Secondary: supplementary downloads (gameplan etc.) */}
          {attachments?.map((att) => (
            <DownloadButton
              key={att.id}
              label={lang === "es" && att.label_es ? att.label_es : att.label}
              variant="secondary"
              onClick={() => onDownload(att.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        color: isPrimary ? "var(--color-bg-void)" : "var(--color-accent)",
        backgroundColor: isPrimary ? "var(--color-accent)" : "transparent",
        border: "2px solid var(--color-accent)",
        borderRadius: "2px",
        padding: "1.1rem 3rem",
        cursor: "none",
        transition: "all 0.3s ease",
        display: "inline-block",
      }}
      onMouseEnter={(e) => {
        if (isPrimary) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--color-accent)";
        } else {
          e.currentTarget.style.backgroundColor = "var(--color-accent)";
          e.currentTarget.style.color = "var(--color-bg-void)";
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary) {
          e.currentTarget.style.backgroundColor = "var(--color-accent)";
          e.currentTarget.style.color = "var(--color-bg-void)";
        } else {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--color-accent)";
        }
      }}
    >
      {label}
    </button>
  );
}
