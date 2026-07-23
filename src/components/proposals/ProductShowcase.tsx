"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import VideoPlayer from "./VideoPlayer";
import DemoFrame from "./DemoFrame";
import { translations } from "@/lib/translations";
import type { ProposalProductShowcase } from "@/lib/proposals";

/**
 * Staged product showcase (e.g. "Haven Deals"). Renders a headline + intro,
 * then one block per stage — a gated portrait promo video beside its blurb and
 * a "Launch demo ↗" control (opens the full-screen gated demo in a new tab) —
 * and finally an inline DemoFrame for the full-product demo as the headline
 * "try the whole thing." Videos/demos are addressed by id and served gated via
 * /api/proposals/video?video=<id> and /api/proposals/demo?demo=<id>.
 */
export default function ProductShowcase({
  number,
  slug,
  showcase,
  lang,
}: {
  number: string;
  slug: string;
  showcase: ProposalProductShowcase;
  lang: "en" | "es";
}) {
  const t = translations[lang];
  const pick = (base?: string, es?: string) => (lang === "es" && es ? es : base);

  const videoUrl = (id: string) =>
    `/api/proposals/video?slug=${encodeURIComponent(slug)}&video=${encodeURIComponent(id)}`;
  const demoUrl = (id: string) =>
    `/api/proposals/demo?slug=${encodeURIComponent(slug)}&demo=${encodeURIComponent(id)}`;

  const launchLabel = lang === "es" ? "Abrir demo" : "Launch demo";

  return (
    <section id="deliverables" className="section-padding" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.productShowcase} />

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)",
            fontWeight: 600,
            lineHeight: 1.12,
            color: "var(--color-text-primary)",
            margin: "1rem 0 0",
            maxWidth: "20ch",
          }}
        >
          {pick(showcase.headline, showcase.headline_es)}
        </h2>

        {showcase.intro && (
          <p
            className="text-body"
            style={{ color: "var(--color-text-secondary)", maxWidth: "640px", margin: "1.1rem 0 0", lineHeight: 1.7 }}
          >
            {pick(showcase.intro, showcase.intro_es)}
          </p>
        )}

        {/* Stage blocks */}
        <div style={{ marginTop: "3.5rem", display: "flex", flexDirection: "column", gap: "4.5rem" }}>
          {showcase.stages.map((stage, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[minmax(0,340px)_1fr]"
              style={{ gap: "2.5rem", alignItems: "center" }}
            >
              {/* Video (portrait) */}
              {stage.videoId ? (
                <VideoPlayer
                  src={videoUrl(stage.videoId)}
                  label={pick(stage.videoLabel, stage.videoLabel_es)}
                  lang={lang}
                  maxWidth="min(340px, 82vw)"
                />
              ) : (
                <div />
              )}

              {/* Text + launch */}
              <div>
                <p
                  className="fde-label"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    margin: 0,
                  }}
                >
                  {pick(stage.title, stage.title_es)}
                </p>
                <p
                  className="text-body"
                  style={{ color: "var(--color-text-secondary)", margin: "1rem 0 0", lineHeight: 1.7, maxWidth: "52ch" }}
                >
                  {pick(stage.blurb, stage.blurb_es)}
                </p>

                {stage.demoId && (
                  <a
                    href={demoUrl(stage.demoId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "1.6rem",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "var(--color-bg-void)",
                      backgroundColor: "var(--color-accent)",
                      border: "2px solid var(--color-accent)",
                      borderRadius: "2px",
                      padding: "0.7rem 1.6rem",
                      textDecoration: "none",
                    }}
                  >
                    {pick(stage.demoLabel, stage.demoLabel_es) ?? launchLabel} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Full-product demo — the headline "try the whole thing" */}
        {showcase.fullDemoId && (
          <div style={{ marginTop: "5rem" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {pick(showcase.fullDemoLabel, showcase.fullDemoLabel_es) ??
                (lang === "es" ? "El producto completo" : "The complete product")}
            </h3>
            {showcase.fullDemoBlurb && (
              <p
                className="text-body"
                style={{ color: "var(--color-text-secondary)", maxWidth: "640px", margin: "1rem 0 2.25rem", lineHeight: 1.7 }}
              >
                {pick(showcase.fullDemoBlurb, showcase.fullDemoBlurb_es)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* DemoFrame breaks out of .container to near-native width, so it lives
          outside the container div (matching the Try Now section layout). */}
      {showcase.fullDemoId && (
        <DemoFrame
          src={demoUrl(showcase.fullDemoId)}
          label={pick(showcase.fullDemoLabel, showcase.fullDemoLabel_es)}
          ctaLabel={lang === "es" ? "Abrir el producto completo" : "Launch the full product"}
          lang={lang}
          fixedViewport={{ w: 1280, h: 1400 }}
        />
      )}
    </section>
  );
}
