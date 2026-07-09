"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import SectionLabel from "@/components/ui/SectionLabel";
import OwlMark from "@/components/shared/OwlMark";
import { translations } from "@/lib/translations";

/**
 * "Try Now" proposal section — a browser-chrome bezel that lazy-loads a
 * proposal's portal demo into an inline iframe. The HTML is served gated by
 * /api/proposals/demo?slug= (same session as the proposal key), so the demo
 * only runs for someone who has unlocked the page.
 *
 * Click flow: a 4s faux loading screen (owl + "Loading your new portal…") plays
 * while the iframe loads underneath; then a diagonal "gate" splits open and the
 * portal fades in. Honors prefers-reduced-motion (skips the theatrics).
 */
type Phase = "idle" | "loading" | "open";

const LOADING_MS = 4000;

export default function TryNowSection({
  number,
  slug,
  lang,
}: {
  number: string;
  slug: string;
  lang: "en" | "es";
}) {
  const t = translations[lang];
  const [phase, setPhase] = useState<Phase>("idle");
  const src = `/api/proposals/demo?slug=${encodeURIComponent(slug)}`;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelARef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Drive the loading → gate-open sequence once the iframe has mounted.
  useEffect(() => {
    if (phase !== "loading") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // No theatrics: reveal the portal straight away.
      if (iframeRef.current) gsap.set(iframeRef.current, { opacity: 1 });
      const id = setTimeout(() => setPhase("open"), 500);
      return () => clearTimeout(id);
    }

    // Portal loads behind the (opaque) gate.
    if (iframeRef.current) gsap.set(iframeRef.current, { opacity: 0 });

    const id = setTimeout(() => {
      const tl = gsap.timeline({ onComplete: () => setPhase("open") });
      // Loading UI (owl + text) fades out first.
      tl.to(contentRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" });
      // Portal fades in as the gate parts.
      tl.to(iframeRef.current, { opacity: 1, duration: 0.9, ease: "power2.out" }, "<0.1");
      // Diagonal gate: the two triangular halves slide apart along the anti-diagonal.
      tl.to(panelARef.current, { xPercent: 135, yPercent: -135, duration: 0.9, ease: "power3.inOut" }, "<");
      tl.to(panelBRef.current, { xPercent: -135, yPercent: 135, duration: 0.9, ease: "power3.inOut" }, "<");
    }, LOADING_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "var(--color-bg-void)",
    zIndex: 1,
    willChange: "transform",
  };

  return (
    <section id="try-now" className="section-padding" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.tryNow} />
        <p
          className="text-body"
          style={{ color: "var(--color-text-secondary)", maxWidth: "640px", margin: "1rem 0 2.25rem", lineHeight: 1.7 }}
        >
          {t.proposals.viewer.tryNowHint}
        </p>

        {/* Bezel */}
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "var(--color-bg-void)",
            boxShadow: "0 30px 80px -40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Browser-chrome bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.7rem 1rem",
              borderBottom: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-surface)",
            }}
          >
            <span style={{ display: "flex", gap: "0.4rem" }} aria-hidden="true">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: c, opacity: 0.85 }} />
              ))}
            </span>
            <span
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.04em",
                color: "var(--color-text-tertiary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Anequim One Console
            </span>
            {phase === "open" && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in a new tab"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  cursor: "none",
                }}
              >
                ↗
              </a>
            )}
          </div>

          {/* Viewport */}
          <div style={{ position: "relative", height: "clamp(420px, 70vh, 720px)", backgroundColor: "var(--color-bg-void)" }}>
            {phase !== "idle" && (
              // No opacity in JSX style — GSAP owns it, so React re-renders
              // don't reset the fade.
              <iframe
                ref={iframeRef}
                src={src}
                title="Anequim One Console"
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              />
            )}

            {phase === "loading" && (
              <>
                {/* Diagonal gate — two triangular halves, seam top-left → bottom-right */}
                <div ref={panelARef} style={{ ...panelStyle, clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
                <div ref={panelBRef} style={{ ...panelStyle, clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
                {/* Loading UI on top of the gate */}
                <div
                  ref={contentRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <OwlMark height={84} />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "1.6rem",
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {t.proposals.viewer.tryNowLoading}
                  </span>
                </div>
              </>
            )}

            {phase === "idle" && (
              <button
                onClick={() => setPhase("loading")}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.25rem",
                  background: "transparent",
                  border: 0,
                  cursor: "none",
                  color: "var(--color-text-primary)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
                    fontWeight: 500,
                    color: "var(--color-bg-void)",
                    backgroundColor: "var(--color-accent)",
                    border: "2px solid var(--color-accent)",
                    borderRadius: "2px",
                    padding: "1rem 2.5rem",
                  }}
                >
                  ▶ {t.proposals.viewer.tryNow}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Anequim One Console — live preview
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
