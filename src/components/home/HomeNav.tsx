"use client";

import { useEffect, useState } from "react";
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
  // backdrop-filter only once content can actually scroll behind the bar —
  // an always-on blur makes iOS re-sample the backdrop every frame while
  // scrolling. At the top the near-opaque black bg reads identically.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fde-nav${scrolled ? " is-scrolled" : ""}`}>
      <TransitionLink href="/" className="fde-nav-brand">
        <BrandLockup full />
      </TransitionLink>
      <div className="fde-nav-links">
        <TransitionLink href="/portfolio" className="fde-nav-link">
          {t.nav.portfolio}
        </TransitionLink>
        {/* Shown only at lg (1024px+). The full wordmark + all links needs
            ~898px on one line in Spanish ("Agenda una llamada"), which exceeds
            every phone's landscape width (≤956px) — so on all phones, portrait
            and landscape, the nav stays compact (brand + Portfolio + language)
            and never overlaps. Book a Call and Engagements remain reachable via
            the hero CTA, contact section, and footer. */}
        <TransitionLink href="/#contact" className="fde-nav-link hidden lg:inline-block">
          {t.nav.bookACall}
        </TransitionLink>
        {/* Shown only at lg (like Book a Call) so the nav never wraps or
            overflows — reachable on mobile via the footer's Navigation column. */}
        <TransitionLink href="/engagements" className="fde-nav-link hidden lg:inline-block">
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
