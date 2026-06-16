"use client";

import HomeNav from "./HomeNav";
import SiteFooter from "@/components/layout/SiteFooter";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

/** Dedicated About page (full bio). Linked from the footer; keeps the bio off
 * the homepage so the page bottom stays uncluttered. */
export default function AboutPage() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].footer;

  return (
    <div className="fde">
      <HomeNav />
      <main
        className="fde-container"
        style={{ paddingTop: "8rem", paddingBottom: "5rem", minHeight: "72svh" }}
      >
        <Reveal>
          <h1
            className="fde-headline fde-gradient-text"
            style={{ fontSize: "clamp(1.9rem, 5vw, 3rem)", maxWidth: "900px" }}
          >
            {t.aboutHeading}
          </h1>
          <div
            style={{
              marginTop: "2rem",
              maxWidth: "780px",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            {t.aboutParagraphs.map((p, i) => (
              <p key={i} style={{ fontSize: "1rem", lineHeight: 1.85, color: "var(--fde-gray)" }}>
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
