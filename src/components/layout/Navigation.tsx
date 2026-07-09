"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { siteConfig } from "@/data/content";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";
import { navigateWithTransition } from "@/lib/transition-nav";
import BrandLockup from "@/components/layout/BrandLockup";

interface NavLink {
  label: string;
  href: string;
}

interface NavigationProps {
  visible?: boolean;
  variant?: "home" | "portal";
  backHref?: string;
  backLabel?: string;
  navOverride?: NavLink[];
}

export default function Navigation({
  visible = true,
  variant = "home",
  backHref,
  backLabel = "Back",
  navOverride,
}: NavigationProps) {
  const isPortal = variant === "portal";
  const hasNavOverride = !!navOverride;
  // The portfolio (home variant, no override) packs the most into the bar:
  // brand + availability badge + section links + Engagements + ES. It needs
  // a higher collapse breakpoint (lg) than the lighter portal/override navs (md).
  const denseHome = !isPortal && !hasNavOverride;
  const linkRowClass = denseHome ? "hidden lg:flex" : "hidden md:flex";
  const burgerClass = denseHome ? "lg:hidden" : "md:hidden";
  const navRef = useRef<HTMLElement>(null);
  const isScrolledRef = useRef(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLAnchorElement[]>([]);
  const { lang, toggle: toggleLang } = useLanguage();
  const t = translations[lang];
  useEffect(() => {
    if (!visible) return;
    if (isPortal || hasNavOverride) {
      // Portal/proposal pages: show nav immediately (no preloader to sequence with)
      if (navRef.current) {
        navRef.current.style.opacity = "1";
      }
      return;
    }
    const tween = gsap.from(navRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
    return () => { tween.kill(); };
  }, [visible, isPortal]);

  useEffect(() => {
    // Portal/proposal pages: always show scrolled background
    if ((isPortal || hasNavOverride) && navRef.current) {
      navRef.current.classList.add("is-scrolled");
      isScrolledRef.current = true;
    }
    const handleScroll = () => {
      const alwaysScrolled = isPortal || hasNavOverride;
      const threshold = alwaysScrolled ? 0 : window.innerHeight * 0.8;
      const shouldBeScrolled = alwaysScrolled ? true : window.scrollY > threshold;
      if (shouldBeScrolled !== isScrolledRef.current) {
        isScrolledRef.current = shouldBeScrolled;
        navRef.current?.classList.toggle("is-scrolled", shouldBeScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPortal]);

  useEffect(() => {
    if (isPortal || hasNavOverride) return; // No home section tracking on portal/proposal pages
    const sections = ["about", "expertise", "journey", "work", "testimonials", "contact"];
    const triggers: ScrollTrigger[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        })
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    if (mobileOpen && mobileMenuRef.current) {
      const tween = gsap.from(mobileLinksRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
      return () => { tween.kill(); };
    }
  }, [mobileOpen]);

  const handleLinkClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Section doesn't exist on this page — navigate to the portfolio page with hash
      window.location.href = "/portfolio" + href;
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="nav"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div
          className="flex items-center gap-3"
          style={{
            width: "100%",
            paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
            paddingRight: "clamp(1.25rem, 4vw, 3rem)",
          }}
        >
          <a
            href="/"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              // Logo always leads back to the main site (the portfolio now
              // lives under /portfolio, so the owl is the way home).
              navigateWithTransition("/");
            }}
            aria-label={`${siteConfig.name}, go to homepage`}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              minWidth: "44px",
              minHeight: "44px",
              // Pin the brand far-left and never let its wordmark shrink/overflow
              // onto neighbouring items (this was the source of the overlap bug).
              order: 0,
              flexShrink: 0,
              marginRight: "auto",
            }}
          >
            <BrandLockup compact={denseHome} />
          </a>

          {/* Nav links: shown on home (default links) or when navOverride provided */}
          {(!isPortal || hasNavOverride) && (
            <div className={`${linkRowClass} items-center gap-4 xl:gap-6`} style={{ order: 1 }}>
              {/* Back to the new main site (portfolio is a sub-section now) */}
              {!hasNavOverride && (
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/");
                  }}
                  className="nav-link hidden xl:inline-flex"
                  style={{ color: "var(--color-accent)", whiteSpace: "nowrap" }}
                >
                  {lang === "es" ? "← Sitio Principal" : "← Main Site"}
                </a>
              )}
              {(navOverride || t.nav.links).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className={`nav-link ${
                    activeSection === link.href.replace("#", "")
                      ? "is-active"
                      : ""
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Shared: context-aware button + theme toggle (same position on ALL pages) */}
          <div className="flex items-center gap-3" style={{ order: 3 }}>
            {/* Context-aware button: Back when backHref provided, Proposals otherwise */}
            {backHref ? (
              <a
                href={backHref}
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithTransition(backHref);
                }}
                style={{
                  fontFamily: '"General Sans", sans-serif',
                  fontSize: "0.66rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "9999px",
                  padding: "0.4rem 0.9rem",
                  minWidth: "96px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  cursor: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent)";
                  e.currentTarget.style.color = "var(--color-bg-void)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--color-accent)";
                }}
              >
                {backLabel || t.nav.back}
              </a>
            ) : !isPortal && !hasNavOverride ? (
              <a
                href="/engagements"
                className="hidden lg:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  navigateWithTransition("/engagements");
                }}
                style={{
                  fontFamily: '"General Sans", sans-serif',
                  fontSize: "0.66rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "9999px",
                  padding: "0.4rem 0.9rem",
                  minWidth: "96px",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  cursor: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent)";
                  e.currentTarget.style.color = "var(--color-bg-void)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--color-accent)";
                }}
              >
                {t.nav.proposals}
              </a>
            ) : null}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              aria-label={lang === "en" ? "Switch to Spanish" : "Switch to English"}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "var(--color-text-secondary)",
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                padding: 0,
                width: "36px",
                height: "36px",
                minWidth: "unset",
                minHeight: "unset",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                cursor: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text-primary)";
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.backgroundColor = "var(--color-bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.backgroundColor = "var(--color-bg-surface)";
              }}
            >
              {t.nav.langButton}
            </button>
          </div>

          {/* Hamburger / Close X (home only) */}
          {!isPortal && <button
            className={`${burgerClass} flex flex-col items-center justify-center`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            style={{
              width: "44px",
              height: "44px",
              padding: "10px",
              position: "relative",
              order: 4,
              zIndex: mobileOpen ? 10001 : "auto",
              cursor: "none",
            }}
          >
            <span
              className="block transition-all duration-300"
              style={{
                width: "20px",
                height: "1.5px",
                backgroundColor: "var(--color-text-primary)",
                position: "absolute",
                transform: mobileOpen
                  ? "rotate(45deg)"
                  : "translateY(-4px)",
              }}
            />
            <span
              className="block transition-all duration-300"
              style={{
                width: "20px",
                height: "1.5px",
                backgroundColor: "var(--color-text-primary)",
                position: "absolute",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block transition-all duration-300"
              style={{
                width: "20px",
                height: "1.5px",
                backgroundColor: "var(--color-text-primary)",
                position: "absolute",
                transform: mobileOpen
                  ? "rotate(-45deg)"
                  : "translateY(4px)",
              }}
            />
          </button>}
        </div>
      </nav>

      {/* Mobile Menu (home only) */}
      {!isPortal && mobileOpen && (
        <div ref={mobileMenuRef} className="mobile-menu">
          <a
            href="/"
            className="text-heading"
            style={{ color: "var(--color-accent)", textDecoration: "none" }}
          >
            {lang === "es" ? "← Sitio Principal" : "← Main Site"}
          </a>
          {t.nav.links.map((link, i) => (
            <a
              key={link.href}
              ref={(el) => {
                if (el) mobileLinksRef.current[i] = el;
              }}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.href);
              }}
              className="text-heading"
              style={{
                color: "var(--color-text-primary)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
          {/* Engagements link — mobile */}
          <a
            href="/engagements"
            className="text-heading"
            style={{
              color: "var(--color-accent)",
              textDecoration: "none",
              marginTop: "0.5rem",
            }}
          >
            {t.nav.proposals}
          </a>

          <button
            onClick={toggleLang}
            className="text-heading"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              color: "var(--color-text-tertiary)",
              background: "none",
              border: "none",
              textAlign: "left",
              padding: "0.75rem 0",
              minHeight: "44px",
            }}
          >
            {t.nav.langButton === "ES" ? "☾ Español" : "☾ English"}
          </button>

        </div>
      )}
    </>
  );
}
