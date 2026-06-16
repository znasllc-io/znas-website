"use client";

import TransitionLink from "@/components/layout/TransitionLink";
import BrandLockup from "@/components/layout/BrandLockup";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

/**
 * Main-site nav, per the design doc: brand lockup left,
 * PORTFOLIO + BOOK A CALL + language toggle right.
 */
export default function HomeNav() {
  const { lang, toggle: toggleLang } = useLanguage();
  const t = homeTranslations[lang];

  return (
    <nav className="fde-nav">
      <TransitionLink href="/" className="fde-nav-brand">
        <BrandLockup full />
      </TransitionLink>
      <div className="fde-nav-links">
        <TransitionLink href="/portfolio" className="fde-nav-link">
          {t.nav.portfolio}
        </TransitionLink>
        {/* Hidden on phones — the hero CTA, contact section, and footer all
            carry Book a Call there, and the Spanish label doesn't fit. */}
        <TransitionLink href="/#contact" className="fde-nav-link hidden sm:inline-block">
          {t.nav.bookACall}
        </TransitionLink>
        {/* Hidden on phones (like Book a Call) so the nav doesn't overflow the
            viewport — reachable on mobile via the footer's Navigation column. */}
        <TransitionLink href="/engagements" className="fde-nav-link hidden sm:inline-block">
          {t.nav.engagements}
        </TransitionLink>
        <button
          onClick={toggleLang}
          aria-label={lang === "en" ? "Switch to Spanish" : "Switch to English"}
          className="fde-nav-link"
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            width: "34px",
            height: "30px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "0.08em",
            cursor: "none",
          }}
        >
          {lang === "en" ? "ES" : "EN"}
        </button>
      </div>
    </nav>
  );
}
