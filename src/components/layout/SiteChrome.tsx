"use client";

import { useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
import { ScrollTrigger } from "@/lib/gsap-config";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";
import PageTransition from "@/components/layout/PageTransition";

/**
 * Universal site chrome, mounted once in the root layout: custom cursor,
 * Lenis smooth scrolling, scroll progress bar, and page-transition overlay.
 * Shared by the main site, portfolio, engagements, proposals, and contact —
 * this is the connective tissue that makes them feel like one site.
 */
export default function SiteChrome() {
  useLenis();

  // One-time migration: the light-theme + accent-picker system was removed;
  // clear its stale localStorage keys so nothing lingers on returning visits.
  useEffect(() => {
    localStorage.removeItem("znas-theme");
    localStorage.removeItem("znas-accent");
  }, []);

  // iOS Safari hardening for the "page won't load until scroll/refresh" report.
  useEffect(() => {
    // 1. Recompute ScrollTrigger start positions once layout has settled
    //    (fonts, images, the collapsing address bar). Without this, on iOS the
    //    positions are computed against an unstable initial viewport and some
    //    scroll-reveal sections stay hidden until the first manual scroll.
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready?.then(refresh).catch(() => {});

    // 2. FOUC safety net: the portfolio hero renders at opacity:0 and is
    //    revealed by its GSAP entrance. If that entrance ever fails to run
    //    (a plugin throwing on an odd browser, a stalled tick), reveal it
    //    anyway so the page is never left blank.
    const foucGuard = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".hero-content, .hero-diagram")
        .forEach((el) => {
          if (getComputedStyle(el).opacity === "0") el.style.opacity = "1";
        });
    }, 1500);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(foucGuard);
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <PageTransition />
    </>
  );
}
