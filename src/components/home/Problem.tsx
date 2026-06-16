"use client";

import Reveal from "./Reveal";
import SplitHeadline from "./SplitHeadline";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

export default function Problem() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].problem;

  return (
    <section id="problem">
      <div className="fde-container" style={{ paddingTop: "6.5rem", paddingBottom: "5.5rem" }}>
        <Reveal>
          <p className="fde-label text-center" style={{ color: "var(--fde-white)" }}>
            {t.label}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div
            className="flex flex-col md:flex-row items-center md:items-start justify-center"
            style={{ gap: "3.5rem", marginTop: "3.2rem", padding: "0 clamp(0rem, 3vw, 2rem)" }}
          >
            <div
              className="fde-headline"
              style={{
                fontSize: "clamp(5.5rem, 13vw, 9.5rem)",
                lineHeight: 0.85,
                flexShrink: 0,
                color: "var(--fde-blue)",
              }}
            >
              95%
            </div>
            <div style={{ maxWidth: "580px", paddingTop: "0.4rem" }}>
              <p style={{ fontSize: "1rem", lineHeight: 1.65, color: "var(--fde-gray)" }}>
                {t.statLead}
                <strong style={{ color: "var(--fde-white)", fontWeight: 600 }}>
                  {t.statBold}
                </strong>
                <br />
                {t.statLine2}
                <br />
                {t.statLine3Pre}
                <em>{t.statLine3Em}</em>.
              </p>
              <p
                className="fde-label"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.16em",
                  color: "var(--fde-gray-dim)",
                  marginTop: "1.5rem",
                }}
              >
                {t.source}
              </p>
            </div>
          </div>
        </Reveal>

        <SplitHeadline
          className="fde-headline text-center"
          style={{ fontSize: "clamp(1.6rem, 4.4vw, 3rem)", marginTop: "5.5rem" }}
        >
          {t.headline}
        </SplitHeadline>

        <Reveal delay={200}>
          <div className="grid md:grid-cols-3" style={{ gap: "2.8rem", marginTop: "3.2rem" }}>
            {t.columns.map((item) => (
              <div key={item.title}>
                <span className="fde-hairline--gray fde-hairline" style={{ marginBottom: "1.5rem" }} />
                <h3
                  className="fde-headline"
                  style={{ fontSize: "0.98rem", fontWeight: 800, lineHeight: 1.35 }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    marginTop: "0.95rem",
                    fontSize: "0.84rem",
                    lineHeight: 1.7,
                    color: "var(--fde-gray-dim)",
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Signature cyan→blue divider into the next section */}
      <span className="fde-hairline fde-hairline--dim" />
    </section>
  );
}
