"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap, SplitText } from "@/lib/gsap-config";
import FlipClock from "@/components/ui/FlipClock";
import { heroContent, siteConfig, cyclingTitles } from "@/data/content";

// Architecture diagram nodes — positioned as % of viewport
const NODES = [
  { id: "client",   x: 6,  y: 12, label: "Client Layer",    desc: "React, Next.js, React Native" },
  { id: "gateway",  x: 24, y: 8,  label: "API Gateway",     desc: "Routing, auth, rate limiting" },
  { id: "services", x: 48, y: 15, label: "Microservices",    desc: "Distributed service mesh" },
  { id: "queue",    x: 72, y: 10, label: "Event Bus",        desc: "Async processing, CQRS" },
  { id: "auth",     x: 36, y: 32, label: "Auth",             desc: "Identity, tokens, SSO" },
  { id: "data",     x: 60, y: 36, label: "Data Layer",       desc: "PostgreSQL, Redis, caching" },
  { id: "infra",    x: 88, y: 28, label: "Infrastructure",   desc: "CI/CD, Docker, monitoring" },
  { id: "mobile",   x: 14, y: 35, label: "Mobile",           desc: "iOS, Android, cross-platform" },
  { id: "cache",    x: 80, y: 42, label: "Cache",            desc: "Redis, CDN, edge caching" },
  { id: "monitor",  x: 92, y: 14, label: "Observability",    desc: "Logs, metrics, tracing" },
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

interface HeroProps {
  preloaderDone: boolean;
}

export default function Hero({ preloaderDone }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const logoTextRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const flipClockRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lineRefs = useRef<Map<number, SVGLineElement>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [flipClockActive, setFlipClockActive] = useState(false);
  const pulseTweenRef = useRef<gsap.core.Tween | null>(null);
  // Track magnetic offsets in px for each node (used to update SVG lines)
  const nodeOffsetsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Update SVG line endpoints to follow node offsets
  const updateLines = useCallback(() => {
    const diagram = diagramRef.current;
    if (!diagram) return;
    const rect = diagram.getBoundingClientRect();
    if (rect.width === 0) return;

    CONNECTIONS.forEach(([fromId, toId], i) => {
      const line = lineRefs.current.get(i);
      if (!line) return;

      const fromNode = NODES.find((n) => n.id === fromId)!;
      const toNode = NODES.find((n) => n.id === toId)!;
      const fromOffset = nodeOffsetsRef.current.get(fromId) || { x: 0, y: 0 };
      const toOffset = nodeOffsetsRef.current.get(toId) || { x: 0, y: 0 };

      // Convert px offset to percentage of container
      const fromOffsetPctX = (fromOffset.x / rect.width) * 100;
      const fromOffsetPctY = (fromOffset.y / rect.height) * 100;
      const toOffsetPctX = (toOffset.x / rect.width) * 100;
      const toOffsetPctY = (toOffset.y / rect.height) * 100;

      line.setAttribute("x1", `${fromNode.x + fromOffsetPctX}%`);
      line.setAttribute("y1", `${fromNode.y + fromOffsetPctY}%`);
      line.setAttribute("x2", `${toNode.x + toOffsetPctX}%`);
      line.setAttribute("y2", `${toNode.y + toOffsetPctY}%`);
    });
  }, []);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      // SplitText setup
      const splits: InstanceType<typeof SplitText>[] = [];
      [line1Ref].forEach((ref) => {
        if (!ref.current) return;
        const split = SplitText.create(ref.current, {
          type: "chars",
        });
        splits.push(split);
      });
      const allChars = splits.flatMap((s) => s.chars);

      // Single orchestrated timeline — uses fromTo to avoid FOUC
      const tl = gsap.timeline();

      // Make containers visible — children start hidden via fromTo
      tl.set(".hero-diagram", { opacity: 1 });
      tl.set(".hero-content", { opacity: 1 });

      // 1. Architecture lines draw in
      tl.fromTo(".arch-line",
        { drawSVG: 0 },
        { drawSVG: "100%", duration: 1.2, ease: "power2.inOut", stagger: 0.1 }
      );

      // 2. Nodes appear
      tl.fromTo(".arch-node",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.04 },
        "-=0.9"
      );

      // 3. Logo mark fades in
      tl.fromTo(logoRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.5"
      );

      // 3a. Brand text fades in
      tl.fromTo(logoTextRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      );

      // 3b. Tagline fades in
      tl.fromTo(taglineRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 0.7, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );

      // 3b. Headline chars compile in
      tl.fromTo(allChars,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.025 },
        "-=0.3"
      );

      // 3c. FlipClock title fades in
      tl.fromTo(flipClockRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
        "-=0.4"
      );

      // 4. Subtitle streams in
      tl.fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );

      // 5. CTA follows
      tl.fromTo(ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.5"
      );

      // 6. Pulse key nodes to show the diagram is alive
      pulseTweenRef.current = gsap.to(".arch-node-pulse", {
        scale: 1.15,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.8,
        delay: tl.duration() + 0.5,
      });

      // 7. Register parallax exit on scroll after entry completes
      tl.call(() => {
        setFlipClockActive(true);
        gsap.to(".hero-content", {
          y: -80,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "20% top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-diagram", {
          y: -50,
          scale: 0.95,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "20% top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => {
      pulseTweenRef.current?.kill();
      pulseTweenRef.current = null;
      ctx.revert();
    };
  }, [preloaderDone]);

  // Floating glow
  useEffect(() => {
    if (!glowRef.current) return;
    const tween = gsap.to(glowRef.current, {
      x: "random(-80, 80)",
      y: "random(-60, 60)",
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => { tween.kill(); };
  }, []);

  // Magnetic node attraction — nodes AND lines move together
  useEffect(() => {
    if (!preloaderDone) return;

    const hasFine = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasFine || prefersReducedMotion) return;

    const diagram = diagramRef.current;
    if (!diagram) return;

    const MAGNETIC_RADIUS = 80;
    const MAGNETIC_STRENGTH = 0.4;

    // Initialize offsets
    NODES.forEach(node => {
      nodeOffsetsRef.current.set(node.id, { x: 0, y: 0 });
    });

    // Setup quickTo for each node — with onUpdate to track offsets and update lines
    const quickTos = new Map<string, { x: ReturnType<typeof gsap.quickTo>; y: ReturnType<typeof gsap.quickTo> }>();

    NODES.forEach(node => {
      const el = nodeRefs.current.get(node.id);
      if (!el) return;
      quickTos.set(node.id, {
        x: gsap.quickTo(el, "x", {
          duration: 0.3,
          ease: "power3.out",
          onUpdate: () => {
            const transform = gsap.getProperty(el, "x") as number;
            const offset = nodeOffsetsRef.current.get(node.id);
            if (offset) offset.x = transform;
            updateLines();
          },
        }),
        y: gsap.quickTo(el, "y", {
          duration: 0.3,
          ease: "power3.out",
          onUpdate: () => {
            const transform = gsap.getProperty(el, "y") as number;
            const offset = nodeOffsetsRef.current.get(node.id);
            if (offset) offset.y = transform;
            updateLines();
          },
        }),
      });
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = diagram.getBoundingClientRect();

      NODES.forEach(node => {
        const quickTo = quickTos.get(node.id);
        if (!quickTo) return;

        const nodeCenterX = rect.left + (node.x / 100) * rect.width;
        const nodeCenterY = rect.top + (node.y / 100) * rect.height;

        const dx = e.clientX - nodeCenterX;
        const dy = e.clientY - nodeCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MAGNETIC_RADIUS) {
          const strength = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
          quickTo.x(dx * strength);
          quickTo.y(dy * strength);
        } else {
          quickTo.x(0);
          quickTo.y(0);
        }
      });
    };

    const handleMouseLeave = () => {
      NODES.forEach(node => {
        const quickTo = quickTos.get(node.id);
        if (quickTo) {
          quickTo.x(0);
          quickTo.y(0);
        }
      });
    };

    diagram.addEventListener("mousemove", handleMouseMove);
    diagram.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      diagram.removeEventListener("mousemove", handleMouseMove);
      diagram.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [preloaderDone, updateLines]);

  const getNode = (id: string) => NODES.find((n) => n.id === id)!;

  return (
    <section
      ref={sectionRef}
      className="relative flex items-end overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-void)",
        paddingTop: "15vh",
        minHeight: "100svh",
      }}
    >
      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width: "60vw",
          height: "60vh",
          left: "20%",
          top: "10%",
          background:
            "radial-gradient(circle, rgba(79,156,247,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Architecture diagram wrapper for parallax */}
      <div ref={diagramRef} className="hero-diagram absolute inset-0" style={{ willChange: "transform", opacity: 0, zIndex: 2 }}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {CONNECTIONS.map(([fromId, toId], i) => {
          const from = getNode(fromId);
          const to = getNode(toId);
          const isHighlighted =
            hoveredNode && (fromId === hoveredNode || toId === hoveredNode);
          return (
            <line
              key={i}
              ref={(el) => { if (el) lineRefs.current.set(i, el); }}
              className="arch-line"
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="var(--color-accent)"
              strokeWidth={isHighlighted ? 1.2 : 0.7}
              strokeOpacity={isHighlighted ? 0.45 : 0.15 + (i * 0.015)}
              style={{ transition: "stroke-opacity 0.3s, stroke-width 0.3s" }}
            />
          );
        })}
      </svg>

      {/* Architecture nodes */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {NODES.map((node) => {
          const isHovered = hoveredNode === node.id;
          const isConnected =
            hoveredNode &&
            CONNECTIONS.some(
              ([a, b]) =>
                (a === hoveredNode && b === node.id) ||
                (b === hoveredNode && a === node.id)
            );
          return (
            <div
              key={node.id}
              ref={(el) => { if (el) nodeRefs.current.set(node.id, el); }}
              className="arch-node absolute"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isHovered ? 10 : 1,
                willChange: "transform",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                cursor: "none",
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Node dot */}
              <div
                className={
                  ["services", "data", "gateway", "monitor"].includes(node.id)
                    ? "arch-node-pulse"
                    : undefined
                }
                style={{
                  width: isHovered ? 14 : 8,
                  height: isHovered ? 14 : 8,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent)",
                  opacity: isHovered ? 0.9 : isConnected ? 0.5 : 0.35,
                  boxShadow: isHovered
                    ? "0 0 20px var(--color-accent-glow)"
                    : "none",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  pointerEvents: "none",
                  flexShrink: 0,
                }}
              />
            </div>
          );
        })}
        </div>
      </div>
      {/* end hero-diagram */}

      {/* Hero content */}
      <div className="hero-content container relative pb-16 md:pb-24" style={{ zIndex: 5, willChange: "transform", opacity: 0 }}>
        {/* Logo lockup */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "fit-content" }}>
          <img
            ref={logoRef}
            src="/logo.png"
            alt=""
            className="logo-img logo-hero"
          />
          <span
            ref={logoTextRef}
            className="logo-lockup-text logo-lockup-text--hero"
            style={{ opacity: 0 }}
          >
            {siteConfig.name} LLC
          </span>
        </div>

        {/* Tagline */}
        <div
          ref={taglineRef}
          className="mb-6"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            opacity: 0.7,
          }}
          data-code-comment="// go version go1.22"
        >
          Jose Sanz &mdash; Tucson, AZ
        </div>

        <h1 className="text-hero-inline" style={{ whiteSpace: "nowrap" }}>
          <span ref={line1Ref} style={{ verticalAlign: "baseline" }}>{heroContent.headline[0]}</span>{" "}
          <span ref={flipClockRef} style={{ opacity: 0, verticalAlign: "baseline" }}>
            <FlipClock
              titles={cyclingTitles}
              intervalMs={2000}
              staggerMs={20}
              paused={!flipClockActive}
            />
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-body mt-6 max-w-xl"
          style={{ color: "var(--color-text-secondary)" }}
          data-code-comment="// 17 * 365 * coffee.Drink()"
        >
          {heroContent.subtitle}
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex items-center gap-6"
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent)",
              borderRadius: "2px",
              padding: "0.6rem 1.4rem",
              textDecoration: "none",
              transition: "all 0.3s ease",
              cursor: "none",
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
            Start a project →
          </a>
          <span className="flex items-center gap-3" style={{ color: "var(--color-text-tertiary)" }}>
            <span className="text-micro">{heroContent.scrollCta}</span>
            <span className="animate-bounce text-sm">↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
