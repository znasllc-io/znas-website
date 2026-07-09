"use client";

import { useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { translations } from "@/lib/translations";

/**
 * "Try Now" proposal section — a browser-chrome bezel that lazy-loads a
 * proposal's portal demo into an inline iframe. The HTML is served gated by
 * /api/proposals/demo?slug= (same session as the proposal key), so the demo
 * only runs for someone who has unlocked the page. The iframe src is set on
 * first click so the (potentially large) portal isn't fetched until asked for.
 */
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const src = `/api/proposals/demo?slug=${encodeURIComponent(slug)}`;

  return (
    <section
      id="try-now"
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.tryNow} />
        <p
          className="text-body"
          style={{
            color: "var(--color-text-secondary)",
            maxWidth: "640px",
            margin: "1rem 0 2.25rem",
            lineHeight: 1.7,
          }}
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
                <span
                  key={c}
                  style={{
                    width: "11px",
                    height: "11px",
                    borderRadius: "50%",
                    backgroundColor: c,
                    opacity: 0.85,
                  }}
                />
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
            {open && (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
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
          <div
            style={{
              position: "relative",
              height: "clamp(420px, 70vh, 720px)",
              backgroundColor: "var(--color-bg-void)",
            }}
          >
            {open ? (
              <iframe
                src={src}
                title="Anequim One Console"
                onLoad={() => setLoading(false)}
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              />
            ) : (
              <button
                onClick={() => {
                  setOpen(true);
                  setLoading(true);
                }}
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

            {open && loading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-tertiary)",
                  backgroundColor: "var(--color-bg-void)",
                  pointerEvents: "none",
                }}
              >
                Loading preview…
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
