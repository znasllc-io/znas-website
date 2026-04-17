"use client";

import { useEffect, useRef, memo } from "react";
import { gsap, SplitText } from "@/lib/gsap-config";
import { ScrollTrigger } from "@/lib/gsap-config";
import { useLanguage } from "@/lib/language";
import { translations } from "@/lib/translations";
import SectionLabel from "@/components/ui/SectionLabel";

function About() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headlineRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // SplitText on headline — chars animate like compiling
      const split = SplitText.create(headlineRef.current!, {
        type: "words",
        mask: "words",
      });

      gsap.from(split.words, {
        yPercent: 100,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: {
          trigger: headlineRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      // Right column content — stagger reveal
      const els = contentRef.current!.querySelectorAll(".reveal-up");
      gsap.from(els, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // Stats grid — scale in
      gsap.from(".stat-cell", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.5)",
        stagger: { each: 0.1, grid: [3, 2], from: "start" },
        scrollTrigger: {
          trigger: ".stat-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Stat counters animate from 0
      document.querySelectorAll(".stat-value[data-target]").forEach((el) => {
        const target = parseFloat(el.getAttribute("data-target")!);
        const pad = parseInt(el.getAttribute("data-pad") || "0");
        const suffix = el.getAttribute("data-suffix") || "";
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: "power2.out",
          delay: 0.3,
          snap: { val: 1 },
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            (el as HTMLElement).textContent =
              String(Math.round(obj.val)).padStart(pad, "0") + suffix;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="container">
        <SectionLabel number=".01" label={t.about.label} />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">
          <div className="md:col-span-3">
            <h2
              ref={headlineRef}
              className="text-display"
              data-code-comment="// systems.Build() // nil err"
            >
              {t.about.statement}
            </h2>
          </div>

          <div ref={contentRef} className="md:col-span-2">
            {/* Short bio */}
            <p
              className="text-body reveal-up mb-10"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t.about.bio}
            </p>

            {/* Stats grid */}
            <div
              className="stat-grid grid grid-cols-2 gap-px"
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              {[
                { value: "17+", target: 17, suffix: "+", pad: 0, comment: "// time.Since(2008)" },
                { value: "07", target: 7, suffix: "", pad: 2, comment: "// len(industries)" },
                { value: "02", target: 2, suffix: "", pad: 2, comment: "// make([]Company, 2)" },
                { value: "MIT", target: null, suffix: "", pad: 0, comment: "// import \"ai/strategy\"" },
                { value: "EN/ES", target: null, suffix: "", pad: 0, comment: "// locale: [2]string" },
                { value: "AZ", target: null, suffix: "", pad: 0, comment: "// os.Getenv(\"HOME\")" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="stat-cell"
                  style={{
                    padding: "1.25rem 1.5rem",
                    backgroundColor: "var(--color-bg-elevated)",
                    borderBottom: i < 4 ? "1px solid var(--color-border)" : "none",
                    borderRight:
                      i % 2 === 0 ? "1px solid var(--color-border)" : "none",
                  }}
                  data-code-comment={stat.comment}
                >
                  <div
                    className={stat.target !== null ? "stat-value" : undefined}
                    data-target={stat.target !== null ? stat.target : undefined}
                    data-pad={stat.pad || undefined}
                    data-suffix={stat.suffix || undefined}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                      letterSpacing: "-0.02em",
                      color: "var(--color-text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-micro mt-1"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {t.about.statLabels[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(About);
