"use client";

import { useEffect, useRef, memo } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { journeyContent } from "@/data/content";
import SectionLabel from "@/components/ui/SectionLabel";

function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !progressRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      // Progress line
      gsap.to(progressRef.current, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });

      // Nodes and cards
      const milestones = journeyContent.milestones;
      milestones.forEach((_, i) => {
        const node = nodesRef.current[i];
        const card = cardsRef.current[i];
        if (!node || !card) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });

        tl.to(node, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          onComplete: () => {
            node.classList.add("is-active");
            if (i === milestones.length - 1) {
              node.classList.add("is-current");
            }
          },
        }).from(
          card,
          {
            x: isMobile ? 30 : i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.2"
        );

        const innerEls = card.querySelectorAll(".card-inner");
        tl.from(
          innerEls,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.4"
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const milestones = journeyContent.milestones;

  // Go-idiomatic tooltips per milestone
  const milestoneComments = [
    "// go run callcenter.go",
    "// import \"amadeus/flights\"",
    "// for range 12.Years { grow() }",
    "// go mod init znas.io",
    "// func init() { visionarys() }",
  ];

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="section-padding"
      style={{ backgroundColor: "var(--color-bg-void)" }}
    >
      <div className="container">
        <SectionLabel
          number={journeyContent.number}
          label={journeyContent.label}
        />

        <div ref={timelineRef} className="relative" style={{ minHeight: "60vh" }}>
          {/* Center line */}
          <div className="timeline-line" />
          <div ref={progressRef} className="timeline-progress" />

          {/* Milestones */}
          <div className="flex flex-col gap-24 md:gap-32 py-12">
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={i} className="relative">
                  {/* Node */}
                  <div
                    ref={(el) => {
                      if (el) nodesRef.current[i] = el;
                    }}
                    className="timeline-node"
                    style={{ top: "50%" }}
                  />

                  {/* Card */}
                  <div
                    className={`
                      md:w-[calc(50%-3rem)]
                      ${isLeft ? "md:mr-auto" : "md:ml-auto"}
                      ml-10 md:ml-0
                    `}
                  >
                    <div
                      ref={(el) => {
                        if (el) cardsRef.current[i] = el;
                      }}
                      className="timeline-card"
                      data-code-comment={milestoneComments[i]}
                    >
                      <div
                        className="card-inner text-micro mb-2"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {m.year}
                      </div>
                      <h3
                        className="card-inner text-subhead mb-1"
                      >
                        {m.role}
                      </h3>
                      <p
                        className="card-inner text-small mb-3"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {m.company}
                      </p>
                      <p
                        className="card-inner text-small"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {m.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Journey);
