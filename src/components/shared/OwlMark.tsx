"use client";

import { forwardRef, useEffect, useRef, type CSSProperties } from "react";

interface OwlMarkProps {
  /** Display height. Omit to let a CSS class control sizing (e.g. .logo-hero). */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Idling ZNAS owl — a tiny (~50KB) looping, muted video used wherever the owl
 * mark appears large. The source has a pure-black background, so
 * `mix-blend-mode: screen` drops the black and the owl blends like the static
 * logo. Falls back to a paused poster frame (the static owl) when the user
 * prefers reduced motion, or if autoplay/the video is unavailable.
 *
 * Forwards its ref to the <video> so callers can drive it (e.g. the portfolio
 * hero's GSAP entrance animation).
 */
const OwlMark = forwardRef<HTMLVideoElement, OwlMarkProps>(function OwlMark(
  { height, className, style },
  ref
) {
  const innerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = innerRef.current;
    if (!v) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.removeAttribute("autoplay");
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* poster shows regardless */
      }
      return;
    }

    // Force muted + start playback. React's `muted` JSX prop is a property, not
    // a reflected attribute, so it can be applied too late for the browser's
    // autoplay gate — leaving the video paused on its poster ("not moving").
    // Setting it imperatively and calling play() makes muted autoplay reliable.
    v.muted = true;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    // If metadata wasn't ready on first try, play once it can.
    v.addEventListener("canplay", tryPlay, { once: true });
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  const setRefs = (el: HTMLVideoElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
  };

  const h =
    height === undefined ? undefined : typeof height === "number" ? `${height}px` : height;

  return (
    <video
      ref={setRefs}
      className={className}
      style={{
        height: h,
        width: "auto",
        display: "block",
        mixBlendMode: "screen",
        pointerEvents: "none",
        ...style,
      }}
      src="/videos/owl-idle.mp4"
      poster="/videos/owl-idle-poster.png"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    />
  );
});

export default OwlMark;
