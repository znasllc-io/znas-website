"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import OwlMark from "@/components/shared/OwlMark";
import { translations } from "@/lib/translations";

/**
 * Gated demo bezel — a browser-chrome frame that lazy-loads a self-contained
 * portal demo into an inline iframe, with the theatrical reveal (4s loading
 * beat → diagonal gate splits open → portal fades in). The HTML is served
 * gated by the passed `src` (already including ?slug= and any &demo=<id>), so
 * it only runs for a viewer who has unlocked the page.
 *
 * Extracted from TryNow so the same frame can present the "full product" demo
 * in ProductShowcase. Renders the bezel only (no <section>/SectionLabel/hint).
 */
type Phase = "idle" | "loading" | "open";

const LOADING_MS = 4000;

export default function DemoFrame({
  src,
  label,
  ctaLabel,
  lang,
  fixedViewport,
}: {
  // Gated demo URL, e.g. /api/proposals/demo?slug=haven&demo=full
  src: string;
  // Browser-chrome title + preview caption. Falls back to a generic label so
  // it never shows another client's name.
  label?: string;
  // Launch-button text. Defaults to the shared "Try Now" string.
  ctaLabel?: string;
  lang: "en" | "es";
  // When set, the iframe always renders at this fixed logical viewport (px) and
  // is scaled DOWN to fit the frame — so the demo paints one known-good layout
  // and can never re-flow/overlap regardless of screen. The frame is also
  // capped at this width, so it never scales *up* (that blew the phone mockup up
  // on large screens). Pick a size tall enough for the demo's content to fit;
  // the Haven demo needs a tall canvas (1280x1400) or the lock-screen
  // notifications collide with the clock. Omit for the default responsive 16:9.
  fixedViewport?: { w: number; h: number };
}) {
  const t = translations[lang];
  const consoleLabel = label ?? "Live Portal";
  const launchLabel = ctaLabel ?? t.proposals.viewer.tryNow;
  const [phase, setPhase] = useState<Phase>("idle");

  // Fixed-viewport scaling: measure the frame width and scale the fixed-size
  // iframe to fit (transform-origin top-left), never above 1:1. The frame is
  // capped at the canvas width (below), so scale is always <= 1.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fixedScale, setFixedScale] = useState(1);
  useEffect(() => {
    if (!fixedViewport) return;
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const apply = () => setFixedScale(Math.min(1, el.clientWidth / fixedViewport.w));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedViewport]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelARef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cursorCleanupRef = useRef<(() => void) | null>(null);

  // The site's custom cursor tracks mousemove on the parent window, which stops
  // firing inside the iframe. The demo is same-origin, so reach into its
  // document to hide the system cursor and relay pointer position back to the
  // parent (offset by the iframe rect) so the custom cursor keeps following.
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

  useEffect(() => {
    if (phase !== "loading") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      if (iframeRef.current) gsap.set(iframeRef.current, { opacity: 1 });
      const id = setTimeout(() => setPhase("open"), 500);
      return () => clearTimeout(id);
    }

    if (iframeRef.current) gsap.set(iframeRef.current, { opacity: 0 });

    const id = setTimeout(() => {
      const tl = gsap.timeline({ onComplete: () => setPhase("open") });
      tl.to(contentRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" });
      tl.to(iframeRef.current, { opacity: 1, duration: 0.9, ease: "power2.out" }, "<0.1");
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
    // Breaks out of the narrow text column so the desktop portal renders near
    // its native width instead of being reflowed and cropped.
    <div
      style={{
        // Cap the frame at the fixed canvas width so it never scales past 1:1
        // (scaling up is what blew the phone mockup up on large screens).
        width: fixedViewport ? `min(${fixedViewport.w}px, 94vw)` : "min(1760px, 94vw)",
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

        {/* Viewport. Default: responsive 16:9. With fixedViewport: the frame
            takes that logical aspect and the iframe renders at the fixed pixel
            size, scaled to fit — so the demo always paints one known-good
            layout and can't re-flow/overlap. */}
        <div
          ref={viewportRef}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: fixedViewport ? `${fixedViewport.w} / ${fixedViewport.h}` : "16 / 9",
            backgroundColor: "var(--color-bg-void)",
            overflow: "hidden",
          }}
        >
          {phase !== "idle" && (
            <iframe
              ref={iframeRef}
              src={src}
              title={consoleLabel}
              onLoad={wireCursorForwarding}
              style={
                fixedViewport
                  ? {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: `${fixedViewport.w}px`,
                      height: `${fixedViewport.h}px`,
                      transform: `scale(${fixedScale})`,
                      transformOrigin: "top left",
                      border: 0,
                      display: "block",
                    }
                  : { width: "100%", height: "100%", border: 0, display: "block" }
              }
            />
          )}

          {phase === "loading" && (
            <>
              <div ref={panelARef} style={{ ...panelStyle, clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
              <div ref={panelBRef} style={{ ...panelStyle, clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
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
                ▶ {launchLabel}
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
  );
}
