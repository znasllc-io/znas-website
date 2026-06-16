"use client";

import Navigation from "@/components/layout/Navigation";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Expertise from "@/components/sections/Expertise";
import Journey from "@/components/sections/Journey";
import Work from "@/components/sections/Work";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import SiteFooter from "@/components/layout/SiteFooter";

// The portfolio loads without a preloader — the loading screen lives on the
// main site's first visit. Cursor/scroll/transition chrome is mounted
// globally by SiteChrome in the root layout.
export default function PortfolioClient() {
  return (
    <>
      <Navigation visible />

      <main>
        <Hero preloaderDone />
        <About />
        <Marquee />
        <Expertise />
        <Journey />
        <Work />
        <Testimonials />
        <Contact />
        <SiteFooter />
      </main>
    </>
  );
}
