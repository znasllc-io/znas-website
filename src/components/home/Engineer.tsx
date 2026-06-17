"use client";

import Reveal from "./Reveal";
import OwlMark from "@/components/shared/OwlMark";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

export default function Engineer() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].engineer;

  return (
    <section id="engineer" className="fde-container" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
      <Reveal>
        <div className="grid md:grid-cols-[280px_1fr] items-center" style={{ gap: "3.5rem" }}>
          <div className="text-center">
            <OwlMark height={160} style={{ margin: "0 auto" }} />
            <div
              style={{
                fontFamily: '"General Sans", sans-serif',
                fontSize: "1.7rem",
                letterSpacing: "0.3em",
                marginLeft: "0.3em",
                marginTop: "1rem",
                color: "var(--fde-white)",
              }}
            >
              ZNAS LLC
            </div>
            <div
              className="fde-label"
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.32em",
                color: "var(--fde-gray-dim)",
                marginTop: "0.45rem",
              }}
            >
              {t.brandSub}
            </div>
          </div>

          <div>
            <h2 className="fde-headline" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}>
              {t.h2The} <span style={{ color: "var(--fde-blue)" }}>{t.h2Engineer}</span> {t.h2Who}{" "}
              <span className="fde-gradient-text">{t.h2Stays}</span>
              <br />
              <span style={{ color: "var(--fde-blue)" }}>{t.h2UntilIt}</span>{" "}
              <span className="fde-gradient-text">{t.h2Works}</span>
            </h2>
            <p
              style={{
                marginTop: "1.4rem",
                maxWidth: "640px",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--fde-gray)",
              }}
            >
              {t.para}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="grid md:grid-cols-3" style={{ gap: "1.5rem", marginTop: "3.8rem" }}>
          {t.traits.map((trait) => (
            <div key={trait.title} className="fde-panel" style={{ borderRadius: "20px" }}>
              <h3 className="fde-headline" style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                {trait.title}
              </h3>
              <p
                style={{
                  marginTop: "0.7rem",
                  fontSize: "0.8rem",
                  lineHeight: 1.65,
                  color: "var(--fde-gray-dim)",
                }}
              >
                {trait.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={180}>
        {/* Consultant vs FDE — two hairlines framing the statement, per the design doc */}
        <div className="text-center" style={{ marginTop: "4rem" }}>
          <span className="fde-hairline fde-hairline--dim" />
          <p
            className="fde-label"
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.26em",
              color: "var(--fde-gray-dim)",
              marginTop: "1.6rem",
            }}
          >
            {t.bannerTop}
          </p>
          <p
            className="fde-label fde-gradient-text"
            style={{
              fontSize: "0.88rem",
              letterSpacing: "0.26em",
              fontWeight: 600,
              marginTop: "0.5rem",
              marginBottom: "1.6rem",
            }}
          >
            {t.bannerBottom}
          </p>
          <span className="fde-hairline fde-hairline--dim" />
        </div>
      </Reveal>
    </section>
  );
}
