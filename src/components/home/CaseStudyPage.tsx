"use client";

import TransitionLink from "@/components/layout/TransitionLink";
import HomeNav from "./HomeNav";
import SiteFooter from "@/components/layout/SiteFooter";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";
import { caseStudies } from "@/data/case-studies";

/** Case-study detail layout, per page 2 of the design doc. Localized. */
export default function CaseStudyPage({ slug }: { slug: string }) {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].caseStudies;
  const data = caseStudies[lang].find((cs) => cs.slug === slug) ?? caseStudies.en[0];

  return (
    <div className="fde">
      <HomeNav />
      <main className="fde-container" style={{ paddingTop: "7.5rem", paddingBottom: "5rem" }}>
        <Reveal>
          <TransitionLink
            href="/#case-studies"
            className="fde-label"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.62rem",
              letterSpacing: "0.2em",
              color: "var(--fde-gray-dim)",
              textDecoration: "none",
              marginBottom: "2.2rem",
            }}
          >
            {t.backLink}
          </TransitionLink>
          <h1
            className="fde-headline fde-gradient-text text-center"
            style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)" }}
          >
            {t.headline}
          </h1>
          <p
            className="text-center"
            style={{ marginTop: "0.8rem", fontSize: "0.85rem", color: "var(--fde-gray-dim)" }}
          >
            {t.sub}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="text-center" style={{ marginTop: "4.5rem" }}>
            <img src="/logo.png" alt="" aria-hidden style={{ height: "56px", margin: "0 auto" }} />
            <div className="flex items-center justify-center" style={{ gap: "1rem", marginTop: "1.4rem" }}>
              <span className="fde-hairline fde-hairline--dim" style={{ width: "70px" }} />
              <p className="fde-label fde-gradient-text" style={{ fontSize: "0.68rem", letterSpacing: "0.3em" }}>
                {data.industry}
              </p>
              <span className="fde-hairline fde-hairline--dim" style={{ width: "70px" }} />
            </div>
            <h2
              style={{ marginTop: "1.4rem", fontSize: "clamp(1.4rem, 3.2vw, 2rem)", fontWeight: 600, color: "var(--fde-white)" }}
            >
              {data.title}
            </h2>
            <p
              style={{
                marginTop: "0.7rem",
                fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
                lineHeight: 1.5,
                color: "var(--fde-blue)",
                fontWeight: 600,
                maxWidth: "640px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {data.subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div
            className="grid md:grid-cols-[1.15fr_1fr] items-center"
            style={{ gap: "2.5rem", marginTop: "3.5rem" }}
          >
            <p style={{ fontSize: "0.88rem", lineHeight: 1.8, color: "var(--fde-gray)" }}>
              {data.body}
            </p>
            <img
              src={data.image}
              alt={data.imageAlt}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                borderRadius: "10px",
                border: "1px solid var(--fde-border)",
              }}
            />
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div style={{ marginTop: "3.5rem" }}>
            <h3
              className="fde-headline"
              style={{
                display: "inline-block",
                fontSize: "1rem",
                letterSpacing: "0.1em",
                padding: "0.2rem 0.4rem 0.2rem 0",
                borderBottom: "2px solid var(--fde-blue)",
              }}
            >
              {t.results}
            </h3>
            <ul style={{ marginTop: "1.2rem", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {data.results.map((r) => (
                <li key={r} style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--fde-white)" }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div
            className="grid sm:grid-cols-3 fde-panel"
            style={{
              gap: "2rem",
              marginTop: "3rem",
              borderRadius: "16px",
              padding: "1.9rem 2rem",
            }}
          >
            {data.facts.map((f) => (
              <div key={f.heading}>
                <p className="fde-label" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--fde-white)" }}>
                  {f.heading}
                </p>
                <ul style={{ listStyle: "none", margin: "0.9rem 0 0", padding: 0 }}>
                  {f.items.map((item) => (
                    <li
                      key={item}
                      style={{ fontSize: "0.74rem", lineHeight: 1.7, color: "var(--fde-gray-dim)" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
