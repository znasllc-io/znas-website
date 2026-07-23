"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import VideoPlayer from "./VideoPlayer";
import { translations } from "@/lib/translations";

/**
 * "Video" showcase section — section chrome (label + hint) around the gated
 * portrait VideoPlayer. The player itself (theatrical reveal + custom controls)
 * lives in VideoPlayer so it can be reused per-stage in ProductShowcase.
 * Streamed range-gated via /api/proposals/video?slug=.
 */
export default function VideoShowcase({
  number,
  slug,
  label,
  hint,
  lang,
}: {
  number: string;
  slug: string;
  label?: string;
  hint?: string;
  lang: "en" | "es";
}) {
  const t = translations[lang];
  const src = `/api/proposals/video?slug=${encodeURIComponent(slug)}`;

  return (
    <section id="video" className="section-padding" style={{ backgroundColor: "var(--color-bg-void)" }}>
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.video} />
        <p
          className="text-body"
          style={{ color: "var(--color-text-secondary)", maxWidth: "640px", margin: "1rem 0 2.25rem", lineHeight: 1.7 }}
        >
          {hint || t.proposals.viewer.videoHint}
        </p>

        <VideoPlayer src={src} label={label} lang={lang} />
      </div>
    </section>
  );
}
