"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

// iOS Safari fires window resize every time the URL bar collapses/expands
// while scrolling; without this flag every one of those triggers a full
// ScrollTrigger.refresh() of all triggers mid-scroll (a visible hitch on
// phones). Orientation changes still refresh normally.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
