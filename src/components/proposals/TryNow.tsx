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
  label,
}: {
  number: string;
  slug: string;
  lang: "en" | "es";
  // Per-proposal demo name (browser-chrome title + preview caption).
  // Falls back to a generic label so it never shows another client's name.
  label?: string;
}) {
  const t = translations[lang];
  const consoleLabel = label ?? "Live Portal";
  const [phase, setPhase] = useState<Phase>("idle");
  const src = `/api/proposals/demo?slug=${encodeURIComponent(slug)}`;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelARef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cursorCleanupRef = useRef<(() => void) | null>(null);

  // The site's custom cursor tracks mousemove on the *parent* window, which
  // stops firing while the pointer is inside the iframe — so it freezes at the
  // boundary and the portal shows the OS cursor instead. The demo is served
  // same-origin (/api/proposals/demo), so we can reach into its document to:
  // (1) hide its system cursor, and (2) relay pointer position back to the
  // parent window (offset by the iframe's rect) so the custom cursor keeps
  // following over the portal. Wired on iframe load; cleaned up on unmount.
  const wireCursorForwarding = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let win: Window | null = null;
    let doc: Document | null = null;
    try {
      win = iframe.contentWindow;
      doc = iframe.contentDocument;
    } catch {
      return; // cross-origin — nothing we can do
    }
    if (!win || !doc) return;

    cursorCleanupRef.current?.();

    try {
      const style = doc.createElement("style");
      style.setAttribute("data-znas-cursor", "");
      style.textContent = "*, *::before, *::after { cursor: none !important; }";
      doc.head?.appendChild(style);
    } catch { /* leave the system cursor if we can't inject */ }

    const forward = (e: MouseEvent) => {
      const rect = iframe.getBoundingClientRect();
      window.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: rect.left + e.clientX,
          clientY: rect.top + e.clientY,
        }),
      );
    };

    try {
      win.addEventListener("mousemove", forward);
      const w = win;
      cursorCleanupRef.current = () => w.removeEventListener("mousemove", forward);
    } catch { /* ignore */ }
  };

  useEffect(() => () => cursorCleanupRef.current?.(), []);

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
      </div>

      {/* Bezel — breaks out of the narrow text column so the desktop portal
          renders near its native width (it's built for ~1440px, full-viewport
          sections) instead of being reflowed and cropped in a tall-narrow box. */}
      <div
        style={{
          width: "min(1760px, 94vw)",
          margin: "0 auto",
          padding: "0 1rem",
          boxSizing: "border-box",
        }}
      >
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
              {consoleLabel}
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

          {/* Viewport — desktop 16:9 so the portal keeps its native
              proportions and isn't cropped. Width is bounded by the 1600px
              bezel wrapper, so height tops out around 900px. */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", backgroundColor: "var(--color-bg-void)" }}>
            {phase !== "idle" && (
              // No opacity in JSX style — GSAP owns it, so React re-renders
              // don't reset the fade.
              <iframe
                ref={iframeRef}
                src={src}
                title={consoleLabel}
                onLoad={wireCursorForwarding}
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
                  {consoleLabel} — live preview
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
