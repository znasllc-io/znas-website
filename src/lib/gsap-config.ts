"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip);

// Dev-only: force tick for headless preview environments where rAF is throttled
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  setInterval(() => gsap.ticker.tick(), 1000 / 30);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip };
