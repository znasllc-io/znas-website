"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, DrawSVGPlugin } from "@/lib/gsap-config";
import { heroContent } from "@/data/content";

// Architecture diagram nodes — positioned as % of viewport
const NODES = [
  { id: "client", x: 6, y: 12, label: "Client Layer", desc: "React, Next.js, React Native" },
  { id: "gateway", x: 24, y: 8, label: "API Gateway", desc: "Routing, auth, rate limiting" },
  { id: "services", x: 48, y: 15, label: "Microservices", desc: "Distributed service mesh" },
  { id: "queue", x: 72, y: 10, label: "Event Bus", desc: "Async processing, CQRS" },
  { id: "auth", x: 36, y: 32, label: "Auth", desc: "Identity, tokens, SSO" },
  { id: "data", x: 60, y: 36, label: "Data Layer", desc: "PostgreSQL, Redis, caching" },
  { id: "infra", x: 88, y: 28, label: "Infrastructure", desc: "CI/CD, Docker, monitoring" },
  { id: "mobile", x: 14, y: 35, label: "Mobile", desc: "iOS, Android, cross-platform" },
  { id: "cache", x: 80, y: 42, label: "Cache", desc: "Redis, CDN, edge caching" },
  { id: "monitor", x: 92, y: 14, label: "Observability", desc: "Logs, metrics, tracing" },
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
  const glowRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      // SplitText setup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const splits: any[] = [];
      [line1Ref, line2Ref].forEach((ref) => {
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

      // 3a. Tagline fades in
      tl.fromTo(taglineRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 0.7, duration: 0.6, ease: "power3.out" },
        "-=0.6"
      );

      // 3b. Headline chars compile in
      tl.fromTo(allChars,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.025 },
        "-=0.3"
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

      // 6. Pulse 3 key nodes to show the diagram is alive
      gsap.to(".arch-node-pulse", {
        scale: 1.15,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.8,
        delay: tl.duration() + 0.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Parallax exit on scroll — only after entry animation completes
  const parallaxCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  useEffect(() => {
    if (!preloaderDone || !sectionRef.current) return;

    const timer = setTimeout(() => {
      parallaxCtxRef.current = gsap.context(() => {
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
      }, sectionRef);
    }, 3000);

    return () => {
      clearTimeout(timer);
      parallaxCtxRef.current?.revert();
    };
  }, [preloaderDone]);

  // Floating glow
  useEffect(() => {
    if (!glowRef.current) return;
    gsap.to(glowRef.current, {
      x: "random(-80, 80)",
      y: "random(-60, 60)",
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  const getNode = (id: string) => NODES.find((n) => n.id === id)!;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-void)", paddingTop: "15vh" }}
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
      <div className="hero-diagram absolute inset-0" style={{ willChange: "transform", opacity: 0 }}>
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
              className="arch-line"
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="var(--color-accent)"
              strokeWidth={isHighlighted ? 1.5 : 0.5}
              strokeOpacity={isHighlighted ? 0.5 : 0.2}
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
              className="arch-node absolute"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isHovered ? 10 : 1,
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
                  backgroundColor: isHovered
                    ? "var(--color-accent)"
                    : isConnected
                      ? "var(--color-accent)"
                      : "var(--color-text-ghost)",
                  opacity: isHovered ? 1 : isConnected ? 0.7 : 0.55,
                  boxShadow: isHovered
                    ? "0 0 24px var(--color-accent-glow)"
                    : "none",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "none",
                }}
              />
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute whitespace-nowrap"
                  style={{
                    top: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    pointerEvents: "none",
                  }}
                >
                  {node.label}
                  <div
                    style={{
                      fontSize: "0.55rem",
                      color: "var(--color-text-tertiary)",
                      letterSpacing: "0.04em",
                      textTransform: "none",
                      marginTop: 2,
                    }}
                  >
                    {node.desc}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
      {/* end hero-diagram */}

      {/* Hero content */}
      <div className="hero-content container relative pb-16 md:pb-24" style={{ zIndex: 5, willChange: "transform", opacity: 0 }}>
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

        <h1 className="text-hero">
          <div ref={line1Ref}>{heroContent.headline[0]}</div>
          <div ref={line2Ref}>{heroContent.headline[1]}</div>
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
          className="mt-10 flex items-center gap-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <span className="text-micro">{heroContent.scrollCta}</span>
          <span className="animate-bounce text-sm">↓</span>
        </div>
      </div>
    </section>
  );
}
