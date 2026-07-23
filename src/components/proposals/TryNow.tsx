"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import DemoFrame from "./DemoFrame";
import { translations } from "@/lib/translations";

/**
 * "Try Now" section — section chrome (label + hint) around the gated DemoFrame,
 * which lazy-loads the proposal's portal demo into an inline iframe. The frame
 * itself (reveal gate + cursor forwarding) lives in DemoFrame so it can also
 * present the full-product demo in ProductShowcase.
 */
export default function TryNowSection({
  number,
  slug,
  lang,
  label,
}: {
  number: string;
  slug: string;
  lang: "en" | "es";
  // Per-proposal demo name (browser-chrome title + preview caption).
  label?: string;
}) {
  const t = translations[lang];
  const src = `/api/proposals/demo?slug=${encodeURIComponent(slug)}`;

  return (
    <section id="try-now" className="section-padding" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.tryNow} />
        <p
          className="text-body"
          style={{ color: "var(--color-text-secondary)", maxWidth: "640px", margin: "1rem 0 2.25rem", lineHeight: 1.7 }}
        >
          {t.proposals.viewer.tryNowHint}
        </p>
      </div>

      <DemoFrame src={src} label={label} lang={lang} />
    </section>
  );
}
