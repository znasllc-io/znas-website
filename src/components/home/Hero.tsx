"use client";

import Reveal from "./Reveal";
import ConstellationField from "@/components/shared/ConstellationField";
import OwlMark from "@/components/shared/OwlMark";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

export default function Hero() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].hero;

  return (
    <section
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: "100svh", padding: "7rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}
    >
      {/* Interactive constellation backdrop — shared with the portfolio hero. */}
      <ConstellationField style={{ zIndex: 1 }} />

      <div
        className="flex flex-col items-center"
        style={{ position: "relative", zIndex: 2 }}
      >
      <Reveal>
        <OwlMark height={100} style={{ margin: "0 auto" }} />
        <div
          style={{
            fontFamily: '"General Sans", sans-serif',
            fontSize: "1.1rem",
            letterSpacing: "0.5em",
            marginLeft: "0.5em",
            marginTop: "1.1rem",
            color: "var(--fde-white)",
          }}
        >
          ZNAS LLC
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p
          className="fde-label"
          style={{ color: "var(--fde-blue)", letterSpacing: "0.4em", marginTop: "2.8rem" }}
        >
          {t.label}
        </p>

        <h1
          className="fde-headline"
          style={{ fontSize: "clamp(2.4rem, 6.5vw, 4.4rem)", marginTop: "1.2rem" }}
        >
          {t.h1a}
          <br />
          <span style={{ color: "var(--fde-blue)" }}>{t.h1b}</span>
        </h1>
      </Reveal>

      <Reveal delay={240}>
        <p
          style={{
            marginTop: "2rem",
            maxWidth: "600px",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--fde-white)",
          }}
        >
          <span style={{ color: "var(--fde-blue)" }}>{t.subBrand}</span>
          {t.subIsA}
          <span style={{ color: "var(--fde-blue)" }}>{t.subFirm}</span>
          <br />
          {t.subLine2}
          <br className="hidden sm:block" /> {t.subLine3}
        </p>

        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: "2.4rem", marginTop: "3rem" }}
        >
          <a href="#contact" className="fde-btn-primary" style={{ padding: "1.05rem 3rem" }}>
            {t.bookACall}
          </a>
          <a href="#how-it-works" className="fde-btn-ghost">
            {t.seeHow}{" "}
            <span className="fde-circle-arrow" aria-hidden="true">
              {/* Geometric SVG arrow — centers exactly, unlike the ↓ glyph
                  whose ink sat off-center within its font line box. */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="6 13 12 19 18 13" />
              </svg>
            </span>
          </a>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
