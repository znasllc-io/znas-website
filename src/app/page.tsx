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

  // Listen for popstate (browser back/forward). If Next.js soft-navigated
  // us back to Home, the Preloader's component tree stays mounted and
  // tweens don't re-run — leaving the preloader stuck covering the page.
  // Force a hard reload in that case so everything mounts fresh and the
  // short "welcome back" preloader plays correctly.
  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname === "/" &&
        sessionStorage.getItem("znas-page-transition")
      ) {
        window.location.reload();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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
