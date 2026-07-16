"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import SectionLabel from "@/components/ui/SectionLabel";
import { translations } from "@/lib/translations";
import type { SafeProposalAsset } from "@/lib/proposals";

/**
 * "Assets" proposal section — a gated download hub. Lists every downloadable
 * deliverable (PDFs, the portal HTML, future videos/images) as a row with a
 * type tag, label, optional description, file size, and a Download button that
 * fetches the file via onDownloadAsset(id) through /api/proposals/asset.
 */

const KIND_LABEL: Record<SafeProposalAsset["kind"], string> = {
  pdf: "PDF",
  html: "HTML",
  video: "Video",
  image: "Image",
  file: "File",
};

function formatBytes(n?: number): string | null {
  if (!n || n <= 0) return null;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

export default function AssetsSection({
  number,
  assets,
  onDownloadAsset,
  lang,
}: {
  number: string;
  assets: SafeProposalAsset[];
  onDownloadAsset: (assetId: string) => void;
  lang: "en" | "es";
}) {
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".asset-reveal", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="assets"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.assets} />

        <p
          className="text-body asset-reveal"
          style={{
            maxWidth: "640px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            margin: "1rem 0 2.25rem",
          }}
        >
          {t.proposals.viewer.assetsIntro}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxWidth: "900px",
          }}
        >
          {assets.map((asset) => {
            const label = lang === "es" && asset.label_es ? asset.label_es : asset.label;
            const description =
              lang === "es" && asset.description_es ? asset.description_es : asset.description;
            const size = formatBytes(asset.size);
            return (
              <div
                key={asset.id}
                className="asset-reveal"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.1rem 1.25rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "2px",
                  backgroundColor: "var(--color-bg-void)",
                }}
              >
                {/* Type tag */}
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "2px",
                    padding: "0.35rem 0.5rem",
                    minWidth: "3.5rem",
                    textAlign: "center",
                  }}
                >
                  {KIND_LABEL[asset.kind]}
                </span>

                {/* Label + description */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.02rem",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {label}
                    {size && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          fontWeight: 400,
                          letterSpacing: "0.04em",
                          color: "var(--color-text-tertiary)",
                          marginLeft: "0.6rem",
                        }}
                      >
                        {size}
                      </span>
                    )}
                  </div>
                  {description && (
                    <p
                      className="text-small"
                      style={{
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.5,
                        marginTop: "0.3rem",
                      }}
                    >
                      {description}
                    </p>
                  )}
                </div>

                {/* Download button */}
                <button
                  onClick={() => onDownloadAsset(asset.id)}
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--color-accent)",
                    borderRadius: "9999px",
                    padding: "0.55rem 1.25rem",
                    cursor: "none",
                    transition: "all 0.3s ease",
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
                  {t.proposals.viewer.downloadAsset} ↓
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
