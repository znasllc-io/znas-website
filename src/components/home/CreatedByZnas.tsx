"use client";

import TransitionLink from "@/components/layout/TransitionLink";
import Reveal from "./Reveal";
import SplitHeadline from "./SplitHeadline";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

/** CoPresent wordmark — the "o" is the blue orbit ring from the brand sheet. */
export function CoPresentWordmark({ height = 56 }: { height?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: '"General Sans", sans-serif',
        fontWeight: 400,
        fontSize: `${height}px`,
        lineHeight: 1,
        color: "var(--fde-white)",
        letterSpacing: "0.01em",
      }}
    >
      C
      <img
        src="/images/home/copresent-ring.png"
        alt="o"
        style={{
          height: `${height * 0.72}px`,
          width: "auto",
          margin: `0 ${height * 0.04}px`,
          transform: "translateY(8%)",
        }}
      />
      Present
    </span>
  );
}

function ProductColumn({
  logo,
  label,
  href,
  cta,
}: {
  logo: React.ReactNode;
  label: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-end justify-center" style={{ minHeight: "110px" }}>
        {logo}
      </div>
      <span className="fde-hairline fde-hairline--dim" style={{ width: "100%", marginTop: "1.6rem" }} />
      <p
        className="fde-label fde-gradient-text"
        style={{ fontSize: "0.78rem", letterSpacing: "0.24em", marginTop: "1.5rem" }}
      >
        {label}
      </p>
      <span className="fde-hairline fde-hairline--dim" style={{ width: "100%", marginTop: "1.5rem" }} />
      <TransitionLink
        href={href}
        className="fde-btn-primary"
        style={{ padding: "0.8rem 2.1rem", marginTop: "1.7rem" }}
      >
        {cta}{" "}
        <span className="fde-btn-circle" style={{ width: "28px", height: "28px", marginRight: "-0.9rem" }}>
          →
        </span>
      </TransitionLink>
    </div>
  );
}

export default function CreatedByZnas() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].createdBy;

  return (
    <section id="created-by-znas" className="fde-container" style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}>
      <SplitHeadline
        className="fde-headline fde-gradient-text text-center"
        style={{ fontSize: "clamp(1.9rem, 5.2vw, 3.2rem)" }}
      >
        {t.headline}
      </SplitHeadline>
      <Reveal>
        <span
          className="fde-hairline fde-hairline--dim"
          style={{ width: "min(560px, 80%)", margin: "1.8rem auto 0" }}
        />
      </Reveal>

      <Reveal delay={140}>
        <div className="grid md:grid-cols-2" style={{ gap: "3.5rem", marginTop: "3.5rem" }}>
          <ProductColumn
            logo={
              <img
                src="/images/home/memql-wordmark.png"
                alt="MemQL"
                style={{ height: "92px", width: "auto" }}
              />
            }
            label={t.memqlLabel}
            href="/memql"
            cta={t.knowMore}
          />
          <ProductColumn
            logo={<CoPresentWordmark height={64} />}
            label={t.copresentLabel}
            href="/copresent"
            cta={t.knowMore}
          />
        </div>
      </Reveal>
    </section>
  );
}
