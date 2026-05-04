"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { siteConfig } from "@/data/content";
import { useTheme, ACCENT_COLORS } from "@/hooks/useTheme";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";
import PageTransition from "@/components/layout/PageTransition";
import { getAvailability, getAllocatedHours, getAvailableHours } from "@/lib/availability";

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
  const navRef = useRef<HTMLElement>(null);
  const isScrolledRef = useRef(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLAnchorElement[]>([]);
  const { resolved, cycle, accent, setAccent } = useTheme();
  const { lang, toggle: toggleLang } = useLanguage();
  const t = translations[lang];
  const [statusOpen, setStatusOpen] = useState(false);
  const triggerExitRef = useRef<((href: string) => void) | null>(null);

  // Availability driven by `src/data/availability.json`. Edit that file to
  // change the weekly cap or current commitments — the indicator + chart
  // recompute automatically on next build.
  const availability = getAvailability();
  const allocatedHours = getAllocatedHours(availability);
  const availableHours = getAvailableHours(availability);
  const isAvailable = availableHours > 0;
  // Distinct fills for chart segments. Cycles if more allocations than
  // entries — the chart still reads as long as the labels are below it.
  const ALLOCATION_COLORS = ["var(--color-accent)", "#14B8A6", "#A855F7", "#F97316"];

  // Close status popup on outside click
  useEffect(() => {
    if (!statusOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".status-badge") && !target.closest("[data-status-popup]")) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [statusOpen]);

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
      // Section doesn't exist on this page — navigate to home page with hash
      window.location.href = "/" + href;
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="nav"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="container flex items-center justify-between">
          <a
            href="/"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              // On home page: scroll to top; otherwise navigate home
              if (!isPortal && !hasNavOverride) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              if (triggerExitRef.current) triggerExitRef.current("/");
              else window.location.href = "/";
            }}
            aria-label={`${siteConfig.name}, go to homepage`}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              minWidth: "44px",
              minHeight: "44px",
            }}
          >
            <img
              src="/logo.png"
              alt=""
              className="logo-img"
              style={{ height: "32px", width: "auto" }}
            />
          </a>
          {!isPortal && !hasNavOverride && (
          <div className="hidden md:flex items-center ml-3 relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="status-badge"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isAvailable ? "#FBBF24" : "#F87171",
                background: isAvailable
                  ? "rgba(251, 191, 36, 0.08)"
                  : "rgba(248, 113, 113, 0.08)",
                border: `1px solid ${isAvailable ? "rgba(251, 191, 36, 0.25)" : "rgba(248, 113, 113, 0.25)"}`,
                borderRadius: "9999px",
                padding: "0.35rem 0.85rem",
                cursor: "none",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isAvailable
                  ? "rgba(251, 191, 36, 0.15)"
                  : "rgba(248, 113, 113, 0.15)";
                e.currentTarget.style.borderColor = isAvailable
                  ? "rgba(251, 191, 36, 0.5)"
                  : "rgba(248, 113, 113, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isAvailable
                  ? "rgba(251, 191, 36, 0.08)"
                  : "rgba(248, 113, 113, 0.08)";
                e.currentTarget.style.borderColor = isAvailable
                  ? "rgba(251, 191, 36, 0.25)"
                  : "rgba(248, 113, 113, 0.25)";
              }}
            >
              <span
                className="status-dot"
                style={{
                  backgroundColor: isAvailable ? "#FBBF24" : "#F87171",
                }}
              />
              {isAvailable ? t.nav.partTime : t.nav.currentlyBooked}
            </button>

            {/* Status popup */}
            {statusOpen && (
              <div
                data-status-popup
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.75rem)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "1.25rem 1.5rem",
                  minWidth: "260px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                  zIndex: 100,
                  fontFamily: "var(--font-mono)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: isAvailable ? "#FBBF24" : "#F87171",
                      boxShadow: isAvailable
                        ? "0 0 8px rgba(251, 191, 36, 0.5)"
                        : "0 0 8px rgba(248, 113, 113, 0.5)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {isAvailable ? t.nav.availablePartTime : t.nav.currentlyBooked}
                  </span>
                </div>
                {/* Weekly allocation chart */}
                <div style={{ marginTop: "0.85rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {t.nav.weeklyAllocation}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {t.nav.hoursOfTotal(allocatedHours, availability.weeklyHoursTotal)}
                    </span>
                  </div>
                  {/* Stacked horizontal bar */}
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "6px",
                      borderRadius: "1px",
                      overflow: "hidden",
                      backgroundColor: "var(--color-bg-surface)",
                      gap: "1px",
                    }}
                  >
                    {availability.allocations.map((a, i) => (
                      <div
                        key={a.label}
                        style={{
                          width: `${(a.hours / availability.weeklyHoursTotal) * 100}%`,
                          backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                        }}
                      />
                    ))}
                    {availableHours > 0 && (
                      <div
                        style={{
                          width: `${(availableHours / availability.weeklyHoursTotal) * 100}%`,
                          backgroundColor: "transparent",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, var(--color-text-ghost) 0px, var(--color-text-ghost) 1px, transparent 1px, transparent 4px)",
                        }}
                      />
                    )}
                  </div>
                  {/* Allocations list */}
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "0.75rem 0 0 0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    {availability.allocations.map((a, i) => (
                      <li
                        key={a.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "0.7rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "1px",
                              backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                              flexShrink: 0,
                            }}
                          />
                          {a.label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "var(--color-text-tertiary)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {a.hours}{t.nav.hoursShort}
                        </span>
                      </li>
                    ))}
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.7rem",
                        color: isAvailable ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                        marginTop: "0.15rem",
                        paddingTop: "0.4rem",
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "1px",
                            backgroundImage:
                              "repeating-linear-gradient(45deg, var(--color-text-ghost) 0px, var(--color-text-ghost) 1px, transparent 1px, transparent 3px)",
                            border: "1px solid var(--color-border)",
                            flexShrink: 0,
                          }}
                        />
                        {t.nav.available}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: isAvailable ? "#FBBF24" : "var(--color-text-tertiary)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {availableHours}{t.nav.hoursShort}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Nav links: shown on home (default links) or when navOverride provided */}
          {(!isPortal || hasNavOverride) && (
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              {/* Accent Color Picker (home only) */}
              {!hasNavOverride && <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.35rem" }}>
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccent(color.id)}
                    aria-label={`Switch accent to ${color.label}`}
                    style={{
                      width: accent === color.id ? "14px" : "10px",
                      height: accent === color.id ? "14px" : "10px",
                      borderRadius: "50%",
                      backgroundColor: color.swatch,
                      border: accent === color.id
                        ? "2px solid var(--color-text-primary)"
                        : "1px solid transparent",
                      cursor: "none",
                      transition: "all 0.2s ease",
                      padding: 0,
                      boxShadow: accent === color.id
                        ? `0 0 8px ${color.swatch}60`
                        : "none",
                    }}
                  />
                ))}
              </div>}

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
          <div className="flex items-center gap-3">
            {/* Context-aware button: Back when backHref provided, Proposals otherwise */}
            {backHref ? (
              <a
                href={backHref}
                onClick={(e) => {
                  e.preventDefault();
                  if (triggerExitRef.current) triggerExitRef.current(backHref);
                  else window.location.href = backHref;
                }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "2px",
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
                href="/proposals"
                className="hidden md:inline-flex"
                onClick={(e) => {
                  e.preventDefault();
                  if (triggerExitRef.current) triggerExitRef.current("/proposals");
                  else window.location.href = "/proposals";
                }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "2px",
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

            {/* Theme Toggle */}
            <button
              onClick={cycle}
              aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.15rem",
                lineHeight: 1,
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
              {resolved === "dark" ? "☀" : "☾"}
            </button>

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
            className="md:hidden flex flex-col items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            style={{
              width: "44px",
              height: "44px",
              padding: "10px",
              position: "relative",
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
          {/* Proposals link — mobile */}
          <a
            href="/proposals"
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
            onClick={cycle}
            className="text-heading mt-4"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              color: "var(--color-text-tertiary)",
              background: "none",
              border: "none",
              textAlign: "left",
            }}
          >
            {resolved === "dark" ? `☀ ${t.nav.lightLabel}` : `☾ ${t.nav.darkLabel}`}
          </button>

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
            }}
          >
            {t.nav.langButton === "ES" ? "☾ Español" : "☾ English"}
          </button>

          {/* Mobile Accent Color Picker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
            role="group"
            aria-label="Accent color"
          >
            {ACCENT_COLORS.map((color) => (
              <div
                key={color.id}
                style={{ padding: "10px" }}
              >
                <button
                  onClick={() => setAccent(color.id)}
                  aria-label={`Switch accent to ${color.label}`}
                  style={{
                    width: accent === color.id ? "18px" : "14px",
                    height: accent === color.id ? "18px" : "14px",
                    borderRadius: "50%",
                    backgroundColor: color.swatch,
                    border: accent === color.id
                      ? "2px solid var(--color-text-primary)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    padding: 0,
                    display: "block",
                    boxShadow: accent === color.id
                      ? `0 0 10px ${color.swatch}70`
                      : "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <PageTransition onReady={(fn) => { triggerExitRef.current = fn; }} />
    </>
  );
}
