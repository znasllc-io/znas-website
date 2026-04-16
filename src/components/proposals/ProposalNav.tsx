"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import { useTheme } from "@/hooks/useTheme";

interface ProposalNavProps {
  title?: string;
}

export default function ProposalNav({ title }: ProposalNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const { resolved, cycle } = useTheme();

  useEffect(() => {
    const tween = gsap.from(navRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
    return () => { tween.kill(); };
  }, []);

  // Scroll detection for background
  useEffect(() => {
    let isScrolled = false;
    const handleScroll = () => {
      const should = window.scrollY > 100;
      if (should !== isScrolled) {
        isScrolled = should;
        navRef.current?.classList.toggle("is-scrolled", should);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="nav"
      style={{ opacity: 0 }}
    >
      <div className="container flex items-center justify-between">
        {/* Logo — links back to homepage */}
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
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
          {title && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
              }}
            >
              {title}
            </span>
          )}
        </a>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={cycle}
            aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
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

          {/* Back to homepage */}
          <a
            href="/"
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
            ← Back
          </a>
        </div>
      </div>
    </nav>
  );
}
