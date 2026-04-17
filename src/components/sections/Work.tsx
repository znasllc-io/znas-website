"use client";

import { useEffect, useRef, useState, memo } from "react";
import { gsap } from "@/lib/gsap-config";
import { workContent } from "@/data/content";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";
import SectionLabel from "@/components/ui/SectionLabel";
import PillTag from "@/components/ui/PillTag";
import ProjectModal, { getProjectUrl } from "@/components/ui/ProjectModal";

function Work() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [selectedProject, setSelectedProject] = useState<{
    title: string;
    challenge: string;
    url: string | null;
  } | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        if (!card) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });

        // ClipPath reveal — blueprint unrolls left to right
        tl.fromTo(
          card,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "power2.inOut" }
        );

        // Then draw internal lines
        tl.from(
          card.querySelectorAll(".blueprint-line"),
          { scaleX: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.1 },
          "-=0.3"
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number={workContent.number} label={t.work.label} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {workContent.projects.map((project, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="blueprint-card group"
              style={{
                position: "relative",
                padding: "2rem",
                border: "1px solid var(--color-border)",
                borderRadius: 0,
                backgroundColor: "transparent",
                transition: "border-color 0.4s",
                cursor: "none",
              }}
              onClick={() => {
                setSelectedProject({
                  title: project.title,
                  challenge: project.challenge,
                  url: getProjectUrl(project.title),
                });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              {/* Corner registration marks */}
              <div className="corner-bl" />
              <div className="corner-br" />

              {/* Blueprint grid background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(var(--color-border) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                  opacity: 0.06,
                }}
              />

              {/* Header: revision + title */}
              <div
                className="flex items-start justify-between mb-6"
                style={{ position: "relative" }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                  data-code-comment={
                    i === 0 ? "// go generate ./asyncapi/..."
                    : i === 1 ? "// tags > tree // obviously"
                    : i === 2 ? "// 12yr monolith.Decompose()"
                    : i === 3 ? "// amadeus.Fly(ctx, global)"
                    : i === 4 ? "// memql.Query(ctx, time.Now())"
                    : "// copresent.Agent.Listen(ctx)"
                  }
                >
                  {project.title}
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.15em",
                    color: "var(--color-text-ghost)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    marginLeft: "1rem",
                  }}
                >
                  REV: {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Divider line */}
              <div
                className="blueprint-line"
                style={{
                  height: 1,
                  backgroundColor: "var(--color-border)",
                  marginBottom: "1.5rem",
                  transformOrigin: "left",
                }}
              />

              {/* Blueprint sections: Challenge / Approach / Impact */}
              <div className="flex flex-col gap-4" style={{ position: "relative" }}>
                {[
                  { label: t.work.challengeLabel, text: t.work.projects[i].challenge },
                  { label: t.work.approachLabel, text: t.work.projects[i].approach },
                  { label: t.work.impactLabel, text: t.work.projects[i].impact },
                ].map((section) => (
                  <div key={section.label}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "var(--color-accent)",
                        marginBottom: "0.35rem",
                        opacity: 0.7,
                      }}
                    >
                      {section.label}
                    </div>
                    <p
                      className="text-small"
                      style={{
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom divider */}
              <div
                className="blueprint-line"
                style={{
                  height: 1,
                  backgroundColor: "var(--color-border)",
                  marginTop: "1.5rem",
                  marginBottom: "1rem",
                  transformOrigin: "left",
                }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <PillTag key={tag} label={tag} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            marginTop: "2.5rem",
          }}
        >
          {t.work.moreLabel}
        </p>
      </div>

      {/* Redirect confirmation modal */}
      <ProjectModal
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </section>
  );
}

export default memo(Work);
