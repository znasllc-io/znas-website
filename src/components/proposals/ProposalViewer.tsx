"use client";

import { useEffect, useRef, Fragment } from "react";
import { gsap } from "@/lib/gsap-config";
import type { SafeProposal, ProposalAttachment, ProposalTeamMember } from "@/lib/proposals";
import SectionLabel from "@/components/ui/SectionLabel";
import RoadmapTimeline from "./RoadmapTimeline";
import InvestmentCards from "./InvestmentCards";
import MilestoneTimeline from "./MilestoneTimeline";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";

// Brand-name glow: cyan aura on CoPresent / Visionarys, white aura on ZNAS.
// The split keeps **bold** working alongside these. Glow CSS is scoped to
// .proposal-page in globals.css so the styling never leaks elsewhere.
const CYAN_WORDS = ["CoPresent", "Visionarys"];
const WHITE_WORDS = ["ZNAS"];
const ALL_GLOW_WORDS = [...CYAN_WORDS, ...WHITE_WORDS];

function glowClassFor(word: string): string | undefined {
  if (CYAN_WORDS.includes(word)) return "glow-cyan";
  if (WHITE_WORDS.includes(word)) return "glow-white";
  return undefined;
}

function renderInline(text: string) {
  // Word-bounded matches so "ZNAS" inside "ZNAS LLC" still highlights, but
  // we don't accidentally match within an unrelated longer token.
  const pattern = new RegExp(
    `(\\*\\*[^*]+\\*\\*|\\b(?:${ALL_GLOW_WORDS.join("|")})\\b)`,
    "g",
  );
  return text.split(pattern).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      const klass = glowClassFor(inner);
      return klass
        ? <strong key={i} className={klass}>{inner}</strong>
        : <strong key={i}>{inner}</strong>;
    }
    const klass = glowClassFor(part);
    if (klass) {
      return <span key={i} className={klass}>{part}</span>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

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
    <div ref={containerRef} className="proposal-page">
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
                members={sections.team.members}
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

            {sections.realEstateAgent && (
              <RealEstateAgentSection
                number={nextNumber()}
                headline={sections.realEstateAgent.headline}
                body={sections.realEstateAgent.body}
                intro={sections.realEstateAgent.intro}
                points={sections.realEstateAgent.points}
                note={sections.realEstateAgent.note}
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
              {renderInline(para)}
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
                {renderInline(c.body)}
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
function TeamMemberRow({ name, tagline, caption, photo }: ProposalTeamMember) {
  return (
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
          className="team-photo"
          style={{
            position: "relative",
            width: "clamp(120px, 20vw, 180px)",
            height: "clamp(120px, 20vw, 180px)",
            flexShrink: 0,
          }}
        >
          {/* Corner brackets — animate from a "+" cross at center to the photo's corners */}
          {(["topLeft", "topRight", "bottomLeft", "bottomRight"] as const).map((corner) => (
            <span
              key={corner}
              className={`team-bracket team-bracket-${corner}`}
              style={{
                position: "absolute",
                width: 16,
                height: 16,
                zIndex: 2,
                ...(corner === "topLeft"    && { top: -3, left: -3, borderTop: "2px solid var(--color-accent)", borderLeft: "2px solid var(--color-accent)" }),
                ...(corner === "topRight"   && { top: -3, right: -3, borderTop: "2px solid var(--color-accent)", borderRight: "2px solid var(--color-accent)" }),
                ...(corner === "bottomLeft" && { bottom: -3, left: -3, borderBottom: "2px solid var(--color-accent)", borderLeft: "2px solid var(--color-accent)" }),
                ...(corner === "bottomRight"&& { bottom: -3, right: -3, borderBottom: "2px solid var(--color-accent)", borderRight: "2px solid var(--color-accent)" }),
              }}
            />
          ))}
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="team-photo-image"
              src={photo}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0 }}
            />
          </div>
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
          style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}
        >
          {renderInline(tagline)}
        </p>
        <p
          className="text-small"
          style={{ color: "var(--color-text-tertiary)", lineHeight: 1.6 }}
        >
          {renderInline(caption)}
        </p>
      </div>
    </div>
  );
}

function TeamSection({
  number,
  name,
  tagline,
  caption,
  photo,
  members,
}: {
  number: string;
  members?: ProposalTeamMember[];
} & ProposalTeamMember) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".team-reveal");
      // 3px = the corner offset used in CSS; 2px = bracket border, halved → centers
      // the 2px-thick borders on the photo's center axes when forming the "+".
      const cornerOffset = 3;
      const borderHalf = 1;

      rows.forEach((row, index) => {
        const photo = row.querySelector<HTMLElement>(".team-photo");
        const img = photo?.querySelector<HTMLElement>(".team-photo-image") ?? null;
        const tl_br = photo?.querySelector<HTMLElement>(".team-bracket-topLeft") ?? null;
        const tr_br = photo?.querySelector<HTMLElement>(".team-bracket-topRight") ?? null;
        const bl_br = photo?.querySelector<HTMLElement>(".team-bracket-bottomLeft") ?? null;
        const br_br = photo?.querySelector<HTMLElement>(".team-bracket-bottomRight") ?? null;
        const allBrackets = [tl_br, tr_br, bl_br, br_br].filter(
          (el): el is HTMLElement => el !== null,
        );

        if (photo && allBrackets.length === 4 && tl_br && tr_br && bl_br && br_br) {
          const w = photo.offsetWidth;
          const h = photo.offsetHeight;
          const dx = w / 2 + cornerOffset - borderHalf;
          const dy = h / 2 + cornerOffset - borderHalf;
          gsap.set(tl_br, { x:  dx, y:  dy });
          gsap.set(tr_br, { x: -dx, y:  dy });
          gsap.set(bl_br, { x:  dx, y: -dy });
          gsap.set(br_br, { x: -dx, y: -dy });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          delay: index * 0.15,
        });

        tl.from(row, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });

        if (allBrackets.length === 4) {
          tl.to(allBrackets, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          }, "-=0.35");
        }

        if (img) {
          tl.to(img, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          }, "-=0.25");
        }
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

        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          <TeamMemberRow name={name} tagline={tagline} caption={caption} photo={photo} />

          {members && members.length > 0 && members.map((m, i) => (
            <Fragment key={i}>
              <div style={{ borderTop: "1px solid var(--color-border)", maxWidth: "900px" }} />
              <TeamMemberRow {...m} />
            </Fragment>
          ))}
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
              {renderInline(para)}
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

/* ── Real Estate Agent Sub-component ── */
// Forward-looking deliverable section. Pure narrative, no inline button.
// Used to surface a concrete in-progress build (e.g. the Haven property
// research agent) without implying a downloadable artifact yet.
function RealEstateAgentSection({
  number,
  headline,
  body,
  intro,
  points,
  note,
}: {
  number: string;
  headline: string;
  body?: string;
  intro?: string;
  points?: { title: string; body: string }[];
  note?: string;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".real-estate-reveal", {
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
      id="realEstateAgent"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel
          number={number}
          label={t.proposals.viewer.sections.realEstateAgent}
        />

        <h2
          className="text-heading real-estate-reveal"
          style={{ maxWidth: "800px", marginBottom: "2rem" }}
        >
          {headline}
        </h2>

        {/* Structured layout: intro → feature points → licensing note */}
        {intro && (
          <p
            className="text-body real-estate-reveal"
            style={{
              maxWidth: "800px",
              color: "var(--color-text-secondary)",
              lineHeight: 1.8,
              marginBottom: points ? "2.5rem" : "1.5rem",
            }}
          >
            {renderInline(intro)}
          </p>
        )}

        {points && points.length > 0 && (
          <div
            className="real-estate-reveal grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ maxWidth: "900px", marginBottom: note ? "2.5rem" : 0 }}
          >
            {points.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "1.5rem",
                  border: "1px solid var(--color-border)",
                  borderLeft: "2px solid var(--color-accent)",
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
                  {p.title}
                </h3>
                <p
                  className="text-small"
                  style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
                >
                  {renderInline(p.body)}
                </p>
              </div>
            ))}
          </div>
        )}

        {note && (
          <p
            className="text-small real-estate-reveal"
            style={{
              maxWidth: "800px",
              color: "var(--color-text-tertiary)",
              lineHeight: 1.7,
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1.5rem",
            }}
          >
            {renderInline(note)}
          </p>
        )}

        {/* Legacy fallback: plain body prose */}
        {body && !intro && (
          <div
            className="real-estate-reveal"
            style={{ maxWidth: "800px", color: "var(--color-text-secondary)", lineHeight: 1.8 }}
          >
            {body.split("\n\n").map((para, i) => (
              <p key={i} className="text-body" style={{ marginBottom: "1.5rem" }}>
                {renderInline(para)}
              </p>
            ))}
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
