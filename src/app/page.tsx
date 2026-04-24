"use client";

import { useState, useCallback, useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
import Preloader from "@/components/layout/Preloader";
import Navigation from "@/components/layout/Navigation";
import ScrollProgress from "@/components/layout/ScrollProgress";
import CustomCursor from "@/components/layout/CustomCursor";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Expertise from "@/components/sections/Expertise";
import Journey from "@/components/sections/Journey";
import Work from "@/components/sections/Work";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useLenis();

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  // WATCHDOG: If Home ends up in the stuck state (preloader visible
  // covering the viewport with the "000" counter, tweens never ran),
  // force a hard reload. This catches all the cases we can't predict:
  //   - Bfcache restore without fresh mount
  //   - Next.js App Router soft nav keeping JS context alive
  //   - Browser back where useEffect doesn't re-run
  //   - Any other mechanism that bypasses React's normal lifecycle
  //
  // A `znas-reload-once` session flag prevents infinite reload loops —
  // if reloading once didn't fix it, we stop and let the user see
  // whatever state they're in rather than looping forever.
  useEffect(() => {
    // Interval-based watchdog. Runs every 400ms. Checks if:
    //  - The return flag is set (user came from /proposals)
    //  - The Preloader element exists and is in its stuck pattern:
    //      counter text is "000" AND counter opacity is "1"
    //  - We haven't already reloaded once to try to fix it.
    const interval = setInterval(() => {
      if (!sessionStorage.getItem("znas-page-transition")) return;
      const counter = document.querySelector(
        ".preloader-counter"
      ) as HTMLElement | null;
      if (!counter) return;
      const isStuck =
        counter.textContent?.trim() === "000" &&
        window.getComputedStyle(counter).opacity === "1";
      if (isStuck && !sessionStorage.getItem("znas-reload-once")) {
        sessionStorage.setItem("znas-reload-once", "1");
        clearInterval(interval);
        window.location.reload();
      }
    }, 400);
    // Clear the one-shot guard after 3s of NOT being stuck, so future
    // back-navigations can self-heal too.
    const clearGuard = setTimeout(() => {
      sessionStorage.removeItem("znas-reload-once");
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(clearGuard);
    };
  }, []);

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} />
      <Navigation visible={preloaderDone} />
      <ScrollProgress />
      <CustomCursor />

      <main>
        <Hero preloaderDone={preloaderDone} />
        <About />
        <Marquee />
        <Expertise />
        <Journey />
        <Work />
        <Testimonials />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
