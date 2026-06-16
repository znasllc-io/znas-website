"use client";

import TransitionLink from "@/components/layout/TransitionLink";
import Reveal from "./Reveal";
import SplitHeadline from "./SplitHeadline";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

export default function WhyZnas() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].whyZnas;

  return (
    <section id="why-znas" className="fde-container" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
      <Reveal>
        <p className="fde-label" style={{ color: "var(--fde-white)" }}>
          {t.label}
        </p>
      </Reveal>
      <SplitHeadline
        className="fde-headline"
        style={{ fontSize: "clamp(1.9rem, 5.2vw, 3.4rem)", marginTop: "1.5rem", maxWidth: "920px" }}
      >
        {t.headline}
      </SplitHeadline>
      <Reveal delay={80}>
        <p style={{ marginTop: "1.1rem", fontSize: "1.15rem", color: "var(--fde-white)" }}>
          {t.subPre}
          <span className="fde-gradient-text" style={{ fontWeight: 500 }}>
            {t.subEm}
          </span>
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="grid sm:grid-cols-3" style={{ gap: "2rem", marginTop: "3.8rem" }}>
          {t.bigStats.map((s) => (
            <div key={s.label}>
              <div
                className="fde-headline"
                style={{ fontSize: "clamp(3.2rem, 6.5vw, 4.6rem)", color: "var(--fde-blue)" }}
              >
                {s.value}
              </div>
              <p
                className="fde-label"
                style={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  color: "var(--fde-gray-dim)",
                  marginTop: "0.6rem",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div className="grid sm:grid-cols-3" style={{ gap: "2rem", marginTop: "3.2rem" }}>
          {t.credentials.map((s) => (
            <div key={s.label}>
              <div
                className="fde-headline"
                style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.5rem)", color: "var(--fde-blue)" }}
              >
                {s.value}
              </div>
              <p
                className="fde-label"
                style={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  color: "var(--fde-gray-dim)",
                  marginTop: "0.45rem",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={220}>
        <div className="text-center" style={{ marginTop: "4rem" }}>
          <TransitionLink href="/portfolio" className="fde-btn-primary">
            {t.cta} <span className="fde-btn-circle">→</span>
          </TransitionLink>
        </div>
      </Reveal>
    </section>
  );
}
