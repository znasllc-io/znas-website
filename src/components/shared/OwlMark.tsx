"use client";

import { forwardRef, useEffect, useRef, useState, type CSSProperties } from "react";

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
 * logo.
 *
 * iOS graceful fallback: when muted-inline autoplay is unavailable — Low Power
 * Mode, a per-site "never auto-play" setting, or prefers-reduced-motion — iOS
 * Safari refuses to play and overlays its "tap to play" button on the poster
 * (and that button is NOT reliably removable via CSS pseudo-elements). So
 * instead of leaving a paused, play-button-decorated <video> on screen, we
 * detect the block and swap to the static owl <img> — the owl simply sits on
 * its still frame, no play button, ever. The video is kept for every device
 * that CAN play it, which is the large majority.
 *
 * Forwards its ref to the <video> so callers can drive it (e.g. the portfolio
 * hero's GSAP entrance animation).
 */
const OwlMark = forwardRef<HTMLVideoElement, OwlMarkProps>(function OwlMark(
  { height, className, style },
  ref
) {
  const innerRef = useRef<HTMLVideoElement>(null);
  // When true, hide the <video> and show the static owl <img> instead.
  const [showStatic, setShowStatic] = useState(false);

  useEffect(() => {
    const v = innerRef.current;
    if (!v) return;

    // Reduced motion: never animate — show the static owl outright.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowStatic(true);
      return;
    }

    let cancelled = false;
    const fallToStatic = () => {
      if (!cancelled) setShowStatic(true);
    };

    // Force muted + start playback. React's `muted` JSX prop is a property, not
    // a reflected attribute, so it can be applied too late for the browser's
    // autoplay gate. Setting it imperatively and calling play() makes muted
    // autoplay reliable; a rejected play() promise means autoplay was blocked.
    v.muted = true;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(fallToStatic);
    };
    tryPlay();
    // If metadata wasn't ready on first try, play once it can.
    v.addEventListener("canplay", tryPlay, { once: true });
    // A load failure (e.g. missing file) should also fall back, not show blank.
    v.addEventListener("error", fallToStatic);

    // Backstop: if play() neither played nor rejected (some blocked states
    // resolve silently), and the video is ready but still paused shortly after
    // mount, treat it as blocked. Guarded on readyState so a slow load isn't
    // mistaken for a block — canplay/catch cover the still-buffering case.
    const t = setTimeout(() => {
      if (!cancelled && v.paused && v.readyState >= 2) setShowStatic(true);
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(t);
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("error", fallToStatic);
    };
  }, []);

  const setRefs = (el: HTMLVideoElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
  };

  const h =
    height === undefined ? undefined : typeof height === "number" ? `${height}px` : height;

  // The visible element (video or its static stand-in) shares these so layout,
  // blend, and caller-passed sizing/margins are identical either way.
  const visualStyle: CSSProperties = {
    height: h,
    width: "auto",
    display: "block",
    mixBlendMode: "screen",
    pointerEvents: "none",
    ...style,
  };

  return (
    <>
      <video
        ref={setRefs}
        className={`owl-mark${className ? ` ${className}` : ""}`}
        style={{ ...visualStyle, display: showStatic ? "none" : visualStyle.display }}
        src="/videos/owl-idle.mp4"
        poster="/videos/owl-idle-poster.png"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      {showStatic && (
        // Static stand-in for the owl when autoplay is unavailable. Same poster
        // frame + blend as the video, so the swap is visually seamless.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={className}
          style={visualStyle}
          src="/videos/owl-idle-poster.png"
          alt=""
          aria-hidden
        />
      )}
    </>
  );
});

export default OwlMark;
