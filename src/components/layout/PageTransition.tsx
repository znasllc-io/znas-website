"use client";

import { useRef, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import {
  registerTriggerExit,
  setTransitionFlag,
  consumeTransitionFlag,
  clearTransitionFlag,
} from "@/lib/transition-nav";

/**
 * Standalone page transition overlay, mounted once via SiteChrome.
 *
 * Navigation is a Next.js client-side route change (router.push) — the app
 * stays hydrated, so the destination appears in a few hundred ms instead of
 * a full re-download/re-parse/re-hydrate cycle. (The previous
 * window.location.href approach made every internal link a full page load —
 * the main reason navigating to /portfolio felt so slow on phones.)
 *
 * - Exit: registered with the transition-nav singleton; any component calls
 *   navigateWithTransition(href) to sweep panels in (desktop pointers only),
 *   then push the route.
 * - Entrance: driven by usePathname — when the route changes (or on first
 *   mount) and the transition flag is set, the panels split open over the
 *   new page. On "/", HomePreloader consults the same flag and skips itself
 *   when the entrance sweep plays — never both.
 * - Touch devices skip the sweep in both directions: on iOS Safari the
 *   animated cover→split could fail to paint mid-load, leaving black panels
 *   covering the page (the historical "didn't load" bug).
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  // Failsafe for an exit whose route change never lands (stalled RSC fetch):
  // reopen the panels so the current page is never left covered.
  const exitFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPanels = useCallback((animate: boolean) => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;

    if (!animate) {
      gsap.set(top, { yPercent: -100 });
      gsap.set(bottom, { yPercent: 100 });
      return;
    }

    gsap.set(top, { yPercent: 0, force3D: true });
    gsap.set(bottom, { yPercent: 0, force3D: true });
    const tl = gsap.timeline({ defaults: { force3D: true } });
    tl.to(top, { yPercent: -100, duration: 0.6, ease: "power3.inOut" });
    tl.to(bottom, { yPercent: 100, duration: 0.6, ease: "power3.inOut" }, "<");
  }, []);

  const triggerExit = useCallback(
    (href: string) => {
      if (isAnimatingRef.current) return;

      // Touch devices: skip the panel sweep, navigate immediately. Keep the
      // flag so the home preloader still skips on arrival.
      if (window.matchMedia("(pointer: coarse)").matches) {
        setTransitionFlag();
        router.push(href);
        return;
      }

      isAnimatingRef.current = true;

      const top = topRef.current;
      const bottom = bottomRef.current;

      if (!top || !bottom) {
        setTransitionFlag();
        router.push(href);
        return;
      }

      setTransitionFlag();

      // Fallback 1: push even if rAF is throttled and the sweep can't play —
      // the click must always result in a navigation.
      const pushFallback = setTimeout(() => router.push(href), 1200);

      const tl = gsap.timeline({
        defaults: { force3D: true },
        onComplete: () => {
          clearTimeout(pushFallback);
          router.push(href);
        },
      });

      // Panels slide in from top and bottom to cover the page
      tl.to(top, { yPercent: 0, duration: 0.5, ease: "power3.inOut" });
      tl.to(bottom, { yPercent: 0, duration: 0.5, ease: "power3.inOut" }, "<");

      // Fallback 2: if the route change never lands (stalled network chunk),
      // reopen so the user isn't stuck staring at black panels. The pathname
      // effect below clears this on a successful arrival.
      exitFailsafeRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
        openPanels(true);
      }, 4000);
    },
    [router, openPanels]
  );

  // Entrance — runs on first mount AND on every client-side route change.
  // Decides whether to play the panels-split reveal (arriving from an
  // in-app navigation) or make sure the panels are parked open.
  useEffect(() => {
    if (exitFailsafeRef.current) {
      clearTimeout(exitFailsafeRef.current);
      exitFailsafeRef.current = null;
    }
    isAnimatingRef.current = false;

    const arrivedViaTransition = consumeTransitionFlag();
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Animate only for desktop in-app arrivals; otherwise park the panels
    // open instantly (touch devices, direct loads, back/forward).
    openPanels(arrivedViaTransition && !coarse);

    // After a client-side navigation the new page's ScrollTriggers were
    // created during its mount — re-measure once layout has settled.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [pathname, openPanels]);

  useEffect(() => {
    registerTriggerExit(triggerExit);
  }, [triggerExit]);

  // Back/forward bfcache restore: the page may have been frozen mid-exit
  // with the panels covering the screen. bfcache restores that frozen state
  // without re-running effects — reset the panels open and drop the stale
  // in-flight flag so the next arrival isn't misread as an in-app one.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      openPanels(false);
      clearTransitionFlag();
      isAnimatingRef.current = false;
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [openPanels]);

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    height: "50vh",
    backgroundColor: "var(--color-bg-void)",
    zIndex: 99998,
    pointerEvents: "none",
    // No permanent will-change/translateZ: two always-composited
    // full-screen layers cost real GPU memory on iOS. GSAP promotes the
    // panels to layers only while they actually animate.
  };

  return (
    <>
      <div
        ref={topRef}
        style={{ ...panelStyle, top: 0, transform: "translateY(-100%)" }}
      />
      <div
        ref={bottomRef}
        style={{ ...panelStyle, bottom: 0, transform: "translateY(100%)" }}
      />
    </>
  );
}
