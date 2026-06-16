"use client";

import Reveal from "./Reveal";
import SplitHeadline from "./SplitHeadline";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

export default function HowItWorks() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].howItWorks;

  return (
    <section id="how-it-works" className="fde-container" style={{ paddingTop: "6.5rem", paddingBottom: "5.5rem" }}>
      <Reveal>
        <p className="fde-label text-center" style={{ color: "var(--fde-white)" }}>
          {t.label}
        </p>
      </Reveal>
      <SplitHeadline
        className="fde-headline fde-gradient-text text-center"
        style={{ fontSize: "clamp(1.8rem, 5vw, 3.4rem)", marginTop: "1.4rem" }}
      >
        {t.headline}
      </SplitHeadline>
      <Reveal delay={80}>
        <p
          className="text-center"
          style={{
            marginTop: "1.3rem",
            fontSize: "0.92rem",
            lineHeight: 1.7,
            color: "var(--fde-gray)",
          }}
        >
          {t.sub1}
          <br />
          {t.sub2}
        </p>
      </Reveal>

      <Reveal delay={140}>
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-4 items-stretch"
          style={{ gap: "1.4rem", marginTop: "3.8rem" }}
        >
          {t.steps.map((s, i) => {
            const highlight = i === t.steps.length - 1;
            return (
              <div
                key={s.num}
                className={`fde-panel${highlight ? " fde-panel--bloom" : ""}`}
                style={{ position: "relative", overflow: "hidden", padding: "2rem 1.6rem 2.2rem" }}
              >
                {highlight && (
                  <>
                    <img
                      src="/logo.png"
                      alt=""
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        height: "46px",
                        opacity: 0.95,
                      }}
                    />
                    <span
                      className="fde-hairline"
                      style={{ position: "absolute", top: "1.45rem", left: 0, right: "5rem", opacity: 0.7 }}
                    />
                  </>
                )}
                <div
                  className={highlight ? "fde-step-title" : "fde-step-title fde-gradient-text"}
                  style={highlight ? { color: "#dcebff" } : undefined}
                >
                  {s.num} /
                  <br />
                  {s.title}
                </div>
                <p
                  style={{
                    marginTop: "1.4rem",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    color: "var(--fde-white)",
                  }}
                >
                  {s.lead}
                </p>
                <p
                  style={{
                    marginTop: "0.6rem",
                    fontSize: "0.8rem",
                    lineHeight: 1.65,
                    color: highlight ? "#c4d8f7" : "var(--fde-gray-dim)",
                  }}
                >
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
