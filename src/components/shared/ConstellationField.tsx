"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap-config";

/**
 * Interactive architecture constellation — the portfolio hero's signature,
 * extracted as a reusable backdrop so the main-site hero can share it.
 *
 * Renders statically visible by default (lines + node dots at their resting
 * opacity), so it never depends on an animation firing to be seen. The pulse
 * and cursor-magnetism are progressive enhancements, gated on
 * non-reduced-motion and a fine pointer. Decorative only (aria-hidden,
 * pointer-events disabled on the marks so it never blocks hero CTAs).
 */

// Positioned as % of the field. Mirrors the portfolio hero diagram.
const NODES = [
  { id: "client", x: 6, y: 12 },
  { id: "gateway", x: 24, y: 8 },
  { id: "services", x: 48, y: 15 },
  { id: "queue", x: 72, y: 10 },
  { id: "auth", x: 36, y: 32 },
  { id: "data", x: 60, y: 36 },
  { id: "infra", x: 88, y: 28 },
  { id: "mobile", x: 14, y: 35 },
  { id: "cache", x: 80, y: 42 },
  { id: "monitor", x: 92, y: 14 },
];

const CONNECTIONS: [string, string][] = [
  ["client", "gateway"],
  ["gateway", "services"],
  ["gateway", "auth"],
  ["services", "queue"],
  ["services", "data"],
  ["queue", "infra"],
  ["data", "infra"],
  ["client", "mobile"],
  ["mobile", "auth"],
  ["auth", "data"],
  ["infra", "cache"],
  ["data", "cache"],
  ["queue", "monitor"],
  ["infra", "monitor"],
];

const PULSE_NODES = new Set(["services", "data", "gateway", "monitor"]);

export default function ConstellationField({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lineRefs = useRef<Map<number, SVGLineElement>>(new Map());
  const offsets = useRef<Map<string, { x: number; y: number }>>(new Map());

  const updateLines = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0) return;
    CONNECTIONS.forEach(([fromId, toId], i) => {
      const line = lineRefs.current.get(i);
      if (!line) return;
      const from = NODES.find((n) => n.id === fromId)!;
      const to = NODES.find((n) => n.id === toId)!;
      const fo = offsets.current.get(fromId) || { x: 0, y: 0 };
      const to_ = offsets.current.get(toId) || { x: 0, y: 0 };
      line.setAttribute("x1", `${from.x + (fo.x / rect.width) * 100}%`);
      line.setAttribute("y1", `${from.y + (fo.y / rect.height) * 100}%`);
      line.setAttribute("x2", `${to.x + (to_.x / rect.width) * 100}%`);
      line.setAttribute("y2", `${to.y + (to_.y / rect.height) * 100}%`);
    });
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let pulse: gsap.core.Tween | null = null;
    const ctx = gsap.context(() => {
      if (!reduced) {
        pulse = gsap.to(".cf-pulse", {
          scale: 1.3,
          transformOrigin: "center",
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.8,
        });
      }
    }, wrap);

    // Infinite tween — run it only while the field is on screen so it
    // doesn't keep the GSAP raf loop ticking after the user scrolls past.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) pulse?.play();
      else pulse?.pause();
    });
    io.observe(wrap);

    let cleanupMagnetic = () => {};
    if (fine && !reduced) {
      // Coalesce line redraws: every animating node's quickTo fires onUpdate
      // for x AND y each tick (up to 20 calls/frame), and each updateLines()
      // rewrites all 56 SVG attributes. One redraw per frame is enough.
      let linesDirty = false;
      const scheduleLineUpdate = () => {
        if (linesDirty) return;
        linesDirty = true;
        requestAnimationFrame(() => {
          linesDirty = false;
          updateLines();
        });
      };

      NODES.forEach((n) => offsets.current.set(n.id, { x: 0, y: 0 }));
      const quickTos = new Map<
        string,
        { x: ReturnType<typeof gsap.quickTo>; y: ReturnType<typeof gsap.quickTo> }
      >();
      NODES.forEach((node) => {
        const el = nodeRefs.current.get(node.id);
        if (!el) return;
        quickTos.set(node.id, {
          x: gsap.quickTo(el, "x", {
            duration: 0.3,
            ease: "power3.out",
            onUpdate: () => {
              const o = offsets.current.get(node.id);
              if (o) o.x = gsap.getProperty(el, "x") as number;
              scheduleLineUpdate();
            },
          }),
          y: gsap.quickTo(el, "y", {
            duration: 0.3,
            ease: "power3.out",
            onUpdate: () => {
              const o = offsets.current.get(node.id);
              if (o) o.y = gsap.getProperty(el, "y") as number;
              scheduleLineUpdate();
            },
          }),
        });
      });

      const RADIUS = 80;
      const STRENGTH = 0.4;
      const onMove = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect();
        NODES.forEach((node) => {
          const q = quickTos.get(node.id);
          if (!q) return;
          const cx = rect.left + (node.x / 100) * rect.width;
          const cy = rect.top + (node.y / 100) * rect.height;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            const s = (1 - d / RADIUS) * STRENGTH;
            q.x(dx * s);
            q.y(dy * s);
          } else {
            q.x(0);
            q.y(0);
          }
        });
      };
      const onLeave = () => {
        NODES.forEach((node) => {
          const q = quickTos.get(node.id);
          if (q) {
            q.x(0);
            q.y(0);
          }
        });
      };
      wrap.addEventListener("mousemove", onMove);
      wrap.addEventListener("mouseleave", onLeave);
      cleanupMagnetic = () => {
        wrap.removeEventListener("mousemove", onMove);
        wrap.removeEventListener("mouseleave", onLeave);
      };
    }

    return () => {
      io.disconnect();
      cleanupMagnetic();
      ctx.revert();
    };
  }, [updateLines]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, ...style }}
    >
      <svg
        className="absolute inset-0"
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {CONNECTIONS.map(([fromId, toId], i) => {
          const from = NODES.find((n) => n.id === fromId)!;
          const to = NODES.find((n) => n.id === toId)!;
          return (
            <line
              key={i}
              ref={(el) => {
                if (el) lineRefs.current.set(i, el);
              }}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="var(--color-accent)"
              strokeWidth={0.7}
              strokeOpacity={0.15 + i * 0.015}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {NODES.map((node) => (
          <div
            key={node.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
            }}
            className="absolute"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className={PULSE_NODES.has(node.id) ? "cf-pulse" : undefined}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--color-accent)",
                opacity: 0.35,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
