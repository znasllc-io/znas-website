"use client";

import TransitionLink from "@/components/layout/TransitionLink";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";
import { caseStudies } from "@/data/case-studies";

export default function CaseStudies() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].caseStudies;
  const studies = caseStudies[lang];

  return (
    <section id="case-studies">
      <span className="fde-hairline fde-hairline--dim" />
      <div className="fde-container" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
        <Reveal>
          <h2
            className="fde-headline fde-gradient-text text-center"
            style={{ fontSize: "clamp(1.9rem, 5.2vw, 3.4rem)" }}
          >
            {t.headline}
          </h2>
          <p
            className="text-center"
            style={{ marginTop: "0.9rem", fontSize: "0.88rem", color: "var(--fde-gray)" }}
          >
            {t.sub}
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className="grid md:grid-cols-2" style={{ gap: "2.8rem", marginTop: "3.8rem" }}>
            {studies.map((cs) => (
              <TransitionLink
                key={cs.slug}
                href={`/case-studies/${cs.slug}`}
                className="group"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid rgba(46, 134, 247, 0.25)",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  className="group-hover:shadow-[0_0_34px_rgba(46,134,247,0.25)]"
                >
                  <img
                    src={cs.image}
                    alt={cs.title}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <p
                  className="fde-label fde-gradient-text text-center"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.3em", marginTop: "1.5rem" }}
                >
                  {cs.industry}
                </p>
                <h3
                  className="text-center"
                  style={{
                    marginTop: "0.55rem",
                    fontSize: "1.08rem",
                    fontWeight: 600,
                    color: "var(--fde-white)",
                  }}
                >
                  {cs.title}
                </h3>
                <p
                  className="text-center"
                  style={{
                    marginTop: "0.45rem",
                    fontSize: "0.82rem",
                    lineHeight: 1.55,
                    color: "var(--fde-blue)",
                    fontWeight: 500,
                    maxWidth: "420px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {cs.subtitle}
                </p>
              </TransitionLink>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
