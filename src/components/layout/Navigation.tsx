"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { navLinks, siteConfig } from "@/data/content";
import { useTheme, ACCENT_COLORS } from "@/hooks/useTheme";
import PageTransition from "@/components/layout/PageTransition";

interface NavigationProps {
  visible: boolean;
}

export default function Navigation({ visible }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const isScrolledRef = useRef(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLAnchorElement[]>([]);
  const { resolved, cycle, accent, setAccent } = useTheme();
  const [statusOpen, setStatusOpen] = useState(false);
  const triggerExitRef = useRef<((href: string) => void) | null>(null);

  // TODO: Replace with real API/system later
  const isAvailable = true;

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
    const tween = gsap.from(navRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
    return () => { tween.kill(); };
  }, [visible]);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > window.innerHeight * 0.8;
      if (shouldBeScrolled !== isScrolledRef.current) {
        isScrolledRef.current = shouldBeScrolled;
        navRef.current?.classList.toggle("is-scrolled", shouldBeScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["about", "expertise", "journey", "work", "contact"];
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
    el?.scrollIntoView({ behavior: "smooth" });
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
            href="#"
            aria-label={`${siteConfig.name} — return to top`}
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
                color: isAvailable ? "#34D399" : "#F87171",
                background: isAvailable
                  ? "rgba(52, 211, 153, 0.08)"
                  : "rgba(248, 113, 113, 0.08)",
                border: `1px solid ${isAvailable ? "rgba(52, 211, 153, 0.25)" : "rgba(248, 113, 113, 0.25)"}`,
                borderRadius: "9999px",
                padding: "0.35rem 0.85rem",
                cursor: "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isAvailable
                  ? "rgba(52, 211, 153, 0.15)"
                  : "rgba(248, 113, 113, 0.15)";
                e.currentTarget.style.borderColor = isAvailable
                  ? "rgba(52, 211, 153, 0.5)"
                  : "rgba(248, 113, 113, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isAvailable
                  ? "rgba(52, 211, 153, 0.08)"
                  : "rgba(248, 113, 113, 0.08)";
                e.currentTarget.style.borderColor = isAvailable
                  ? "rgba(52, 211, 153, 0.25)"
                  : "rgba(248, 113, 113, 0.25)";
              }}
            >
              <span
                className="status-dot"
                style={{
                  backgroundColor: isAvailable ? "#34D399" : "#F87171",
                }}
              />
              {/* ALTERNATE COPY (pending Jose confirmation): "Available part-time — currently founding Visionarys.io" */}
              {isAvailable ? "Available" : "Unavailable"}
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
                      backgroundColor: isAvailable ? "#34D399" : "#F87171",
                      boxShadow: isAvailable
                        ? "0 0 8px rgba(52, 211, 153, 0.5)"
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
                    {isAvailable ? "Open for Projects" : "Currently Booked"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {isAvailable
                    ? "Jose is accepting new consulting and architecture engagements."
                    : "Jose is currently focused on existing projects. Check back soon."}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {/* Accent Color Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
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
            </div>

            {navLinks.map((link) => (
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

            {/* Proposals — framed CTA, distinct from scroll links */}
            <a
              href="/proposals"
              onClick={(e) => {
                e.preventDefault();
                if (triggerExitRef.current) {
                  triggerExitRef.current("/proposals");
                } else {
                  window.location.href = "/proposals";
                }
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
              Proposals
            </a>

            {/* Theme Toggle — far right, larger */}
            <button
              onClick={cycle}
              aria-label={
                resolved === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.15rem",
                color: "var(--color-text-secondary)",
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                padding: "0.55rem 0.85rem",
                minWidth: "44px",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                cursor: "none",
                marginLeft: "0.5rem",
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
          </div>

          {/* Hamburger / Close X */}
          <button
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
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div ref={mobileMenuRef} className="mobile-menu">
          {navLinks.map((link, i) => (
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
            Proposals
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
            {resolved === "dark" ? "☀ Light" : "☾ Dark"}
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
