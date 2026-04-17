"use client";

import { useState, useCallback } from "react";
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
