"use client";

import HomeNav from "./HomeNav";
import SiteFooter from "@/components/layout/SiteFooter";
import Reveal from "./Reveal";
import { CoPresentWordmark } from "./CreatedByZnas";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

/**
 * Shared "Created by ZNAS" product page (MemQL / CoPresent), localized.
 * Layout per page 2 of the design doc.
 */
export default function ProductPage({ product }: { product: "memql" | "copresent" }) {
  const { lang } = useLanguage();
  const t = homeTranslations[lang];
  const p = t.products[product];

  return (
    <div className="fde">
      <HomeNav />
      <main className="fde-container text-center" style={{ paddingTop: "8rem", paddingBottom: "6rem" }}>
        <Reveal>
          <h1
            className="fde-headline fde-gradient-text"
            style={{ fontSize: "clamp(1.9rem, 5vw, 3rem)" }}
          >
            {t.createdBy.headline}
          </h1>
        </Reveal>

        <Reveal delay={100}>
          <img src="/logo.png" alt="" aria-hidden style={{ height: "52px", margin: "4rem auto 0" }} />
          <p
            className="fde-label"
            style={{ fontSize: "0.68rem", letterSpacing: "0.3em", color: "var(--fde-blue)", marginTop: "1.3rem" }}
          >
            {p.label}
          </p>
          <h2
            style={{
              marginTop: "1.6rem",
              fontSize: "clamp(1.4rem, 3.4vw, 2.1rem)",
              fontWeight: 600,
              color: "var(--fde-white)",
              lineHeight: 1.3,
            }}
          >
            {p.h2a}
            <br className="hidden sm:block" /> {p.h2b}
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <div className="flex items-center justify-center" style={{ marginTop: "2.8rem" }}>
            {product === "memql" ? (
              <img
                src="/images/home/memql-wordmark.png"
                alt="MemQL"
                style={{ height: "clamp(90px, 16vw, 160px)", width: "auto" }}
              />
            ) : (
              <CoPresentWordmark height={72} />
            )}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div style={{ maxWidth: "760px", margin: "2.6rem auto 0" }}>
            <p style={{ fontSize: "0.87rem", lineHeight: 1.85, color: "var(--fde-gray)" }}>
              {p.body}
            </p>
            <p style={{ marginTop: "1.4rem", fontSize: "0.82rem", fontStyle: "italic", color: "var(--fde-gray-dim)" }}>
              {p.byline}
            </p>
          </div>

          <div style={{ marginTop: "3rem" }}>
            <a
              href={
                product === "memql"
                  ? "https://github.com/znas-io"
                  : "mailto:znas@znas.io?subject=CoPresent%20guest%20list"
              }
              target={product === "memql" ? "_blank" : undefined}
              rel={product === "memql" ? "noopener noreferrer" : undefined}
              className="fde-btn-primary"
            >
              {p.cta} <span className="fde-btn-circle">→</span>
            </a>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
