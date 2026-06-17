"use client";

import Reveal from "./Reveal";
import OwlMark from "@/components/shared/OwlMark";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

export default function Quotes() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].quotes;

  return (
    <section id="testimonials" className="fde-container" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
      <Reveal>
        <div className="flex items-start justify-between">
          <h2 className="fde-headline" style={{ fontSize: "clamp(1.7rem, 4.4vw, 2.7rem)" }}>
            {t.h2a}
            <br />
            <span className="fde-gradient-text">{t.h2b}</span> {t.h2c}{" "}
            <span style={{ color: "var(--fde-blue)" }}>{t.h2d}</span>
          </h2>
          <OwlMark height={120} className="hidden md:block" style={{ opacity: 0.95 }} />
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="grid md:grid-cols-3 items-stretch" style={{ gap: "1.5rem", marginTop: "3.2rem" }}>
          {t.items.map((q) => (
            <div
              key={q.name}
              className="fde-panel flex flex-col"
              style={{ borderRadius: "16px", padding: "2rem 1.7rem 1.9rem" }}
            >
              <div className="fde-quote-mark" style={{ alignSelf: "flex-end", marginBottom: "1.6rem" }}>
                &rdquo;
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  lineHeight: 1.75,
                  color: "var(--fde-gray)",
                  flexGrow: 1,
                }}
              >
                {q.text}
              </p>
              <div style={{ marginTop: "1.8rem" }}>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--fde-white)" }}>
                  {q.name}
                </p>
                <p style={{ fontSize: "0.74rem", color: "var(--fde-gray-dim)", marginTop: "0.3rem" }}>
                  {q.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
