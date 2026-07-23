"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import VideoPlayer from "./VideoPlayer";
import DemoFrame from "./DemoFrame";
import { translations } from "@/lib/translations";
import type { ProposalProductShowcase } from "@/lib/proposals";

/**
 * Staged product showcase (e.g. "Haven Deals"). Renders a headline + intro,
 * then one block per stage — a gated portrait promo video beside its blurb,
 * with that stage's interactive demo embedded full-width below it — and finally
 * the full-product demo as the headline "try the whole thing." Every embedded
 * demo uses DemoFrame's embed mode (chrome stripped, active device scaled to
 * fill at its true aspect ratio). Videos/demos are addressed by id and served
 * gated via /api/proposals/video?video=<id> and /api/proposals/demo?demo=<id>.
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
  // Default embed frame: landscape, sized to the desktop workbench. Phone-only
  // stages override this with a portrait frame via stage.embedViewport.
  const DEFAULT_EMBED = { w: 1528, h: 1000 };

  const kickerStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--color-accent)",
    margin: 0,
  };

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
      </div>

      {/* Stage blocks — each: an intro row (video + text) in the readable
          container, then that stage's demo embedded full-width below it. */}
      {showcase.stages.map((stage, i) => (
        <div key={i} style={{ marginTop: i === 0 ? "3.5rem" : "5rem" }}>
          <div className="container">
            <div
              className="grid md:grid-cols-[minmax(0,340px)_1fr]"
              style={{ gap: "2.5rem", alignItems: "center" }}
            >
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

              <div>
                <p className="fde-label" style={kickerStyle}>
                  {pick(stage.title, stage.title_es)}
                </p>
                <p
                  className="text-body"
                  style={{ color: "var(--color-text-secondary)", margin: "1rem 0 0", lineHeight: 1.7, maxWidth: "52ch" }}
                >
                  {pick(stage.blurb, stage.blurb_es)}
                </p>
              </div>
            </div>
          </div>

          {stage.demoId && (
            <div style={{ marginTop: "2rem" }}>
              <DemoFrame
                src={demoUrl(stage.demoId)}
                label={pick(stage.title, stage.title_es)}
                ctaLabel={pick(stage.demoLabel, stage.demoLabel_es) ?? launchLabel}
                lang={lang}
                embed
                fixedViewport={stage.embedViewport ?? DEFAULT_EMBED}
              />
            </div>
          )}
        </div>
      ))}

      {/* Full-product demo — the headline "try the whole thing" */}
      {showcase.fullDemoId && (
        <div className="container" style={{ marginTop: "5rem" }}>
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

      {showcase.fullDemoId && (
        <DemoFrame
          src={demoUrl(showcase.fullDemoId)}
          label={pick(showcase.fullDemoLabel, showcase.fullDemoLabel_es)}
          ctaLabel={lang === "es" ? "Abrir el producto completo" : "Launch the full product"}
          lang={lang}
          embed
          fixedViewport={{ w: 1528, h: 1000 }}
        />
      )}
    </section>
  );
}
