"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, DrawSVGPlugin } from "@/lib/gsap-config";
import { ScrollTrigger } from "@/lib/gsap-config";
import { expertiseContent } from "@/data/content";
import SectionLabel from "@/components/ui/SectionLabel";

// Stack architecture — technologies as connected nodes
const STACK_LAYERS = [
  {
    id: "systems",
    label: "Systems",
    color: "var(--color-accent)",
    nodes: ["Distributed Systems", "Microservices", "Public APIs", "AsyncAPI"],
  },
  {
    id: "engineering",
    label: "Engineering",
    color: "#60A5FA",
    nodes: ["Go", ".NET / C#", "Python", "React", "Mobile"],
  },
  {
    id: "infra",
    label: "Infrastructure",
    color: "#34D399",
    nodes: ["Docker", "Kubernetes", "CI/CD", "PostgreSQL", "Redis"],
  },
  {
    id: "ai",
    label: "AI & Strategy",
    color: "#A78BFA",
    nodes: ["Machine Learning", "LLMs", "AI Architecture", "Open Source"],
  },
];

// Vertical connections between layers (fromLayerIdx, fromNodeIdx, toLayerIdx, toNodeIdx)
const CROSS_CONNECTIONS: [number, number, number, number][] = [
  [0, 1, 1, 0], // Microservices → Go
  [0, 1, 1, 1], // Microservices → .NET
  [0, 2, 1, 0], // Public APIs → Go
  [0, 3, 1, 0], // AsyncAPI → Go
  [1, 0, 2, 0], // Go → Docker
  [1, 1, 2, 3], // .NET → PostgreSQL
  [1, 2, 3, 0], // Python → ML
  [1, 2, 3, 1], // Python → LLMs
  [2, 0, 2, 1], // Docker → Kubernetes
  [2, 3, 2, 4], // PostgreSQL → Redis
  [3, 0, 3, 1], // ML → LLMs
  [3, 1, 3, 2], // LLMs → AI Architecture
];

export default function Expertise() {
  const sectionRef = useRef<HTMLElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate layer rows
      gsap.from(".stack-layer", {
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: diagramRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      // Animate nodes within layers
      gsap.from(".stack-node", {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.5)",
        stagger: 0.03,
        scrollTrigger: {
          trigger: diagramRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // Animate pillar descriptions
      gsap.from(".pillar-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".pillar-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Get node position for SVG lines (computed on render)
  const getNodeKey = (layerIdx: number, nodeIdx: number) =>
    `${layerIdx}-${nodeIdx}`;

  return (
    <section
      id="expertise"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel
          number={expertiseContent.number}
          label={expertiseContent.label}
        />

        {/* Stack architecture diagram */}
        <div ref={diagramRef} className="relative mt-12 mb-20">
          {/* Connection lines SVG overlay */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {/* Vertical cross-connections drawn as lines between layer rows */}
          </svg>

          {/* Layer rows */}
          <div className="flex flex-col gap-8">
            {STACK_LAYERS.map((layer, layerIdx) => (
              <div key={layer.id} className="stack-layer flex items-center gap-6">
                {/* Category label */}
                <div
                  className="w-28 shrink-0 text-right"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: layer.color,
                    opacity: 0.8,
                  }}
                >
                  {layer.label}
                </div>

                {/* Connecting line */}
                <div
                  className="hidden md:block"
                  style={{
                    width: 24,
                    height: 1,
                    backgroundColor: layer.color,
                    opacity: 0.2,
                  }}
                />

                {/* Tech nodes */}
                <div className="flex flex-wrap items-center gap-3">
                  {layer.nodes.map((tech, nodeIdx) => {
                    const key = getNodeKey(layerIdx, nodeIdx);
                    const isHovered = hoveredNode === key;
                    return (
                      <div
                        key={tech}
                        ref={(el) => {
                          if (el) nodeRefs.current.set(key, el);
                        }}
                        className="stack-node flex items-center gap-2"
                        style={{ cursor: "none" }}
                        onMouseEnter={() => setHoveredNode(key)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Node dot */}
                        <div
                          style={{
                            width: isHovered ? 10 : 6,
                            height: isHovered ? 10 : 6,
                            borderRadius: "50%",
                            backgroundColor: layer.color,
                            opacity: isHovered ? 1 : 0.5,
                            boxShadow: isHovered
                              ? `0 0 12px ${layer.color}`
                              : "none",
                            transition:
                              "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        />
                        {/* Node label */}
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.04em",
                            color: isHovered
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                            transition: "color 0.3s",
                          }}
                        >
                          {tech}
                        </span>

                        {/* Horizontal connector to next node */}
                        {nodeIdx < layer.nodes.length - 1 && (
                          <div
                            className="hidden md:block"
                            style={{
                              width: 16,
                              height: 1,
                              backgroundColor: layer.color,
                              opacity: 0.15,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar descriptions */}
        <div className="pillar-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {expertiseContent.pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="pillar-card"
              style={{
                padding: "1.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                backgroundColor: "var(--color-bg-elevated)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.1rem, 1.5vw, 1.4rem)",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
                data-code-comment={
                  pillar.id === "architecture"
                    ? "// go build -race ./systems"
                    : pillar.id === "engineering"
                      ? "// for range languages { ship() }"
                      : pillar.id === "ai"
                        ? "// import \"mit/ai-strategy\""
                        : "// go run startup.go // x2"
                }
              >
                {pillar.title}
              </h3>
              <p
                className="text-small"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
