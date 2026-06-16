"use client";

import TransitionLink from "@/components/layout/TransitionLink";
import Reveal from "@/components/home/Reveal";
import { useLanguage } from "@/lib/language";
import { homeTranslations } from "@/lib/home-translations";

/**
 * Shared site footer (FDE design) — used by the main site, case studies,
 * product pages, the portfolio, and proposal pages.
 */
export default function SiteFooter() {
  const { lang } = useLanguage();
  const t = homeTranslations[lang].footer;
  const navT = homeTranslations[lang].nav;

  const columns = [
    {
      heading: t.navHeading,
      links: [
        { label: t.navLinks.problem, href: "/#problem" },
        { label: t.navLinks.howItWorks, href: "/#how-it-works" },
        { label: t.navLinks.whyJose, href: "/#why-znas" },
        { label: navT.engagements, href: "/engagements" },
        { label: t.navLinks.startProject, href: "/#contact" },
      ],
    },
    {
      heading: t.joseHeading,
      links: [
        { label: t.joseLinks.about, href: "/about" },
        { label: t.joseLinks.portfolio, href: "/portfolio" },
        { label: t.joseLinks.github, href: "https://github.com/znas-io" },
        { label: t.joseLinks.linkedin, href: "https://www.linkedin.com/in/znas-io/" },
      ],
    },
    {
      heading: t.contactHeading,
      links: [
        { label: "znas@znas.io", href: "mailto:znas@znas.io" },
        { label: t.contactStartProject, href: "/#contact" },
      ],
    },
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--fde-border)", padding: "4rem 0 0", background: "var(--fde-black)", color: "var(--fde-white)" }}>
      <div className="fde-container">
        {/* About José Sanz — short summary; full bio lives on the /about page */}
        <Reveal>
          <div>
            <h2
              className="fde-label"
              style={{ fontSize: "0.78rem", letterSpacing: "0.18em", color: "var(--fde-blue)", fontWeight: 700 }}
            >
              {t.aboutHeading}
            </h2>
            <p
              style={{
                marginTop: "1.1rem",
                fontSize: "0.78rem",
                lineHeight: 1.75,
                color: "var(--fde-gray-dim)",
                maxWidth: "640px",
              }}
            >
              {t.aboutSummary}
            </p>
          </div>
        </Reveal>

        {/* Footer grid */}
        <div
          className="grid md:grid-cols-[1fr_2fr]"
          style={{ gap: "3rem", marginTop: "4rem", paddingBottom: "3rem" }}
        >
          <div>
            <div className="flex items-center" style={{ gap: "0.9rem" }}>
              <img src="/logo.png" alt="ZNAS owl" style={{ height: "44px", width: "auto" }} />
              <span
                style={{
                  fontFamily: '"General Sans", sans-serif',
                  fontSize: "1rem",
                  letterSpacing: "0.22em",
                  color: "var(--fde-white)",
                }}
              >
                ZNAS LLC
              </span>
            </div>
            <p
              className="fde-label"
              style={{ fontSize: "0.52rem", letterSpacing: "0.2em", color: "var(--fde-gray-dim)", marginTop: "1.1rem", lineHeight: 1.9 }}
            >
              {t.tagline1}
              <br />
              {t.tagline2}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: "2rem" }}>
            {columns.map((col) => (
              <div key={col.heading}>
                <p
                  className="fde-label"
                  style={{ fontSize: "0.56rem", letterSpacing: "0.22em", color: "var(--fde-gray-dim)" }}
                >
                  {col.heading}
                </p>
                <ul style={{ listStyle: "none", margin: "1rem 0 0", padding: 0 }}>
                  {col.links.map((link) => (
                    <li key={link.label} style={{ marginBottom: "0.6rem" }}>
                      {link.href.startsWith("http") || link.href.startsWith("mailto") ? (
                        <a
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="fde-nav-link"
                          style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "none", color: "var(--fde-gray)" }}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <TransitionLink
                          href={link.href}
                          className="fde-nav-link"
                          style={{ fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "none", color: "var(--fde-gray)" }}
                        >
                          {link.label}
                        </TransitionLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--fde-border)", paddingTop: "1.1rem", paddingBottom: "1.1rem" }}>
        <div className="fde-container flex flex-wrap items-center justify-between" style={{ gap: "1rem" }}>
          <span
            className="fde-label"
            style={{ fontSize: "0.52rem", letterSpacing: "0.18em", color: "var(--fde-gray-dim)" }}
          >
            {t.bottomBrand}
          </span>
          <span className="flex items-center" style={{ gap: "2rem" }}>
            <TransitionLink href="/portfolio" className="fde-nav-link" style={{ fontSize: "0.52rem" }}>
              {t.bottomPortfolio}
            </TransitionLink>
            <TransitionLink href="/#contact" className="fde-nav-link" style={{ fontSize: "0.52rem" }}>
              {t.bottomBook}
            </TransitionLink>
          </span>
        </div>
      </div>
    </footer>
  );
}
