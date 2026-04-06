"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "@/lib/gsap-config";
import { navLinks, siteConfig } from "@/data/content";
import { useTheme } from "@/hooks/useTheme";

interface NavigationProps {
  visible: boolean;
}

export default function Navigation({ visible }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLAnchorElement[]>([]);
  const { resolved, cycle } = useTheme();

  useEffect(() => {
    if (!visible) return;
    gsap.from(navRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
  }, [visible]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.8);
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
      gsap.from(mobileLinksRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
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
        className={`nav ${isScrolled ? "is-scrolled" : ""}`}
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
          <div className="hidden md:flex items-center gap-1.5 ml-3">
            <span className="status-dot" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
              }}
            >
              Available
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {/* Theme Toggle */}
            <button
              onClick={cycle}
              aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                color: "var(--color-text-tertiary)",
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "0.25rem 0.5rem",
                transition: "color 0.3s, border-color 0.3s",
                cursor: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text-primary)";
                e.currentTarget.style.borderColor = "var(--color-border-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-tertiary)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              {resolved === "dark" ? "☀" : "☾"}
            </button>
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
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-px transition-transform duration-300"
              style={{
                backgroundColor: "var(--color-text-primary)",
                transform: mobileOpen ? "rotate(45deg) translateY(4px)" : "",
              }}
            />
            <span
              className="block w-5 h-px transition-opacity duration-300"
              style={{
                backgroundColor: "var(--color-text-primary)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-transform duration-300"
              style={{
                backgroundColor: "var(--color-text-primary)",
                transform: mobileOpen
                  ? "rotate(-45deg) translateY(-4px)"
                  : "",
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
        </div>
      )}
    </>
  );
}
