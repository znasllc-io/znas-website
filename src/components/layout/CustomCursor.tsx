"use client";

import { useEffect, useRef, memo } from "react";
import { gsap } from "@/lib/gsap-config";

function AnnotationHint() {
  const hintRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hintRef.current) return;
    const hasFine = window.matchMedia("(pointer: fine)").matches;
    if (!hasFine) return;
    const t1 = gsap.to(hintRef.current, { opacity: 1, duration: 0.8, delay: 4, ease: "power2.out" });
    const t2 = gsap.to(hintRef.current, { opacity: 0, duration: 0.5, delay: 7, ease: "power2.in" });
    return () => { t1.kill(); t2.kill(); };
  }, []);
  return (
    <div
      ref={hintRef}
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        color: "var(--color-text-ghost)",
        pointerEvents: "none",
        zIndex: 99999,
        opacity: 0,
      }}
    >
      // hover elements for annotations
    </div>
  );
}

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    const cursor = cursorRef.current;
    const tooltip = tooltipRef.current;
    if (!cursor || !tooltip) return;

    cursor.style.display = "block";

    // Smooth cursor following (ring)
    const xTo = gsap.quickTo(cursor, "left", {
      duration: 0.15,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(cursor, "top", {
      duration: 0.15,
      ease: "power2.out",
    });

    // Tooltip follows slightly slower for layered feel
    const txTo = gsap.quickTo(tooltip, "left", {
      duration: 0.3,
      ease: "power2.out",
    });
    const tyTo = gsap.quickTo(tooltip, "top", {
      duration: 0.3,
      ease: "power2.out",
    });

    const handleMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      txTo(e.clientX + 28);
      tyTo(e.clientY - 8);
    };

    // Event delegation — no MutationObserver needed
    const interactiveSelector =
      "a, button, [role='button'], input, textarea, select";

    let typewriterTween: gsap.core.Tween | null = null;

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Interactive element hover
      if (target.closest(interactiveSelector)) {
        cursor.classList.add("is-active");
      }

      // Code comment hover
      const commentEl = target.closest("[data-code-comment]") as HTMLElement | null;
      if (commentEl) {
        // Skip if element or ancestor is still invisible (pre-animation)
        const style = window.getComputedStyle(commentEl);
        if (parseFloat(style.opacity) < 0.1) return;

        // Skip if cursor is in whitespace outside actual text bounds
        const rects = commentEl.getClientRects();
        const inText = Array.from(rects).some(
          (r) =>
            e.clientX >= r.left - 8 &&
            e.clientX <= r.right + 8 &&
            e.clientY >= r.top - 8 &&
            e.clientY <= r.bottom + 8
        );
        if (!inText) return;

        const comment = commentEl.getAttribute("data-code-comment") || "";
        cursor.classList.add("is-code-comment");

        // Typewriter effect
        tooltip.textContent = "";
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateY(0)";

        const obj = { length: 0 };
        typewriterTween?.kill();
        typewriterTween = gsap.to(obj, {
          length: comment.length,
          duration: comment.length * 0.025,
          ease: "none",
          snap: { length: 1 },
          onUpdate: () => {
            const i = Math.round(obj.length);
            tooltip.textContent =
              comment.slice(0, i) + (i < comment.length ? "\u258F" : "");
          },
          onComplete: () => {
            tooltip.textContent = comment;
          },
        });
      }
    };

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement | null;

      // Interactive leave
      if (target.closest(interactiveSelector)) {
        if (!related || !target.closest(interactiveSelector)?.contains(related)) {
          cursor.classList.remove("is-active");
        }
      }

      // Code comment leave
      const commentEl = target.closest("[data-code-comment]");
      if (commentEl && (!related || !commentEl.contains(related))) {
        cursor.classList.remove("is-code-comment");
        typewriterTween?.kill();
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translateY(4px)";
      }
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  return (
    <>
      <AnnotationHint />
      <div ref={cursorRef} className="cursor-dot" style={{ display: "none" }} />
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 99999,
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          color: "var(--color-accent)",
          backgroundColor: "color-mix(in srgb, var(--color-bg-void) 85%, transparent)",
          border: "1px solid var(--color-border)",
          borderRadius: "4px",
          padding: "0.3rem 0.6rem",
          backdropFilter: "blur(8px)",
          opacity: 0,
          transform: "translateY(4px)",
          transition: "opacity 0.25s, transform 0.25s",
          whiteSpace: "nowrap",
        }}
      />
    </>
  );
}

export default memo(CustomCursor);
