"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap-config";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    challenge: string;
    url: string | null;
  } | null;
}

// Map project titles to GitHub URLs
const PROJECT_URLS: Record<string, string | null> = {
  "asyncapi-codegen": "https://github.com/znas-io/asyncapi-codegen",
  "t4t — Tag-based Filesystem": "https://github.com/znas-io/t4t",
  "Language Platform Infrastructure": null,
  "Airline Technology Systems": null,
};

export function getProjectUrl(title: string): string | null {
  return PROJECT_URLS[title] ?? null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
}: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const handleClose = useCallback(() => {
    if (!tlRef.current) {
      onClose();
      return;
    }
    const closeTl = gsap.timeline({
      onComplete: onClose,
    });
    closeTl.to(panelRef.current, {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.4,
      ease: "power2.inOut",
    });
    closeTl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      },
      "-=0.2"
    );
  }, [onClose]);

  // Open animation
  useEffect(() => {
    if (!isOpen || !overlayRef.current || !panelRef.current) return;

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Overlay fade in
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    // Panel unrolls left-to-right (blueprint style)
    tl.fromTo(
      panelRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power2.inOut" },
      "-=0.1"
    );

    // Inner content elements stagger in
    const innerEls = panelRef.current.querySelectorAll(".modal-reveal");
    tl.from(
      innerEls,
      {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power3.out",
      },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  if (!isOpen || !project) return null;

  const hasUrl = project.url !== null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "color-mix(in srgb, var(--color-bg-void) 80%, transparent)",
        backdropFilter: "blur(8px)",
        cursor: "auto",
      }}
    >
      <div
        ref={panelRef}
        style={{
          position: "relative",
          width: "min(480px, 90vw)",
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
          padding: "2rem",
        }}
      >
        {/* Blueprint corner marks */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            width: 12,
            height: 12,
            borderTop: "1px solid var(--color-accent)",
            borderLeft: "1px solid var(--color-accent)",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: 12,
            height: 12,
            borderTop: "1px solid var(--color-accent)",
            borderRight: "1px solid var(--color-accent)",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -1,
            left: -1,
            width: 12,
            height: 12,
            borderBottom: "1px solid var(--color-accent)",
            borderLeft: "1px solid var(--color-accent)",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 12,
            height: 12,
            borderBottom: "1px solid var(--color-accent)",
            borderRight: "1px solid var(--color-accent)",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        {/* Blueprint grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.04,
          }}
        />

        {/* Header label */}
        <div
          className="modal-reveal"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            opacity: 0.6,
            marginBottom: "0.75rem",
          }}
        >
          {hasUrl ? "// redirect confirmation" : "// access restricted"}
        </div>

        {/* Project title */}
        <h3
          className="modal-reveal"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}
        >
          {project.title}
        </h3>

        {/* Divider */}
        <div
          className="modal-reveal"
          style={{
            height: 1,
            backgroundColor: "var(--color-border)",
            marginBottom: "1rem",
          }}
        />

        {/* Description */}
        <p
          className="modal-reveal"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          {project.challenge}
        </p>

        {/* Status / URL info */}
        {!hasUrl && (
          <p
            className="modal-reveal"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--color-text-ghost)",
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              border: "1px dashed var(--color-border)",
            }}
          >
            Private project &mdash; no public repository
          </p>
        )}

        {/* Buttons */}
        <div className="modal-reveal flex gap-3">
          {hasUrl && (
            <a
              href={project.url!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "var(--color-bg-void)",
                backgroundColor: "var(--color-accent)",
                border: "1px solid var(--color-accent)",
                transition:
                  "background-color 0.3s, color 0.3s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = "transparent";
                el.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = "var(--color-accent)";
                el.style.color = "var(--color-bg-void)";
              }}
            >
              Visit on GitHub
            </a>
          )}
          <button
            onClick={handleClose}
            style={{
              flex: hasUrl ? "none" : 1,
              minWidth: hasUrl ? 100 : undefined,
              height: 44,
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
              backgroundColor: "transparent",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              transition:
                "border-color 0.3s, color 0.3s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--color-text-secondary)";
              el.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--color-border)";
              el.style.color = "var(--color-text-secondary)";
            }}
          >
            {hasUrl ? "Cancel" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
