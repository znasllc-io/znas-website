"use client";

import { useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
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

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <PageTransition />
    </>
  );
}
