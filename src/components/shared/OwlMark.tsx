"use client";

import { forwardRef, useEffect, useState, type CSSProperties } from "react";

interface OwlMarkProps {
  /** Display height. Omit to let a CSS class control sizing (e.g. .logo-hero). */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

const ANIMATED_SRC = "/videos/owl-idle.webp";
const STATIC_SRC = "/videos/owl-idle-poster.png";

/**
 * Idling ZNAS owl — a small looping animation used wherever the owl mark
 * appears large.
 *
 * Served as an animated WebP `<img>`, deliberately NOT a `<video>`: Safari
 * (both iOS and macOS) overlays its media-controls / "tap to play" button on
 * a <video> whenever it won't autoplay — e.g. Low Power Mode — and that
 * overlay isn't reliably removable. An <img> can never show those controls,
 * animates on every browser, and plays even in Low Power Mode. The source
 * frames are white-on-black, so `mix-blend-mode: screen` drops the black and
 * the owl blends like the static logo.
 *
 * Honors prefers-reduced-motion by swapping to a single static frame.
 *
 * Forwards its ref to the <img> so callers can drive it (e.g. the portfolio
 * hero's GSAP entrance animation).
 */
const OwlMark = forwardRef<HTMLImageElement, OwlMarkProps>(function OwlMark(
  { height, className, style },
  ref
) {
  // Default to the animated source; swap to the still frame when the visitor
  // prefers reduced motion (checked after mount — SSR can't know it).
  const [src, setSrc] = useState(ANIMATED_SRC);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSrc(STATIC_SRC);
    }
  }, []);

  const h =
    height === undefined ? undefined : typeof height === "number" ? `${height}px` : height;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      className={`owl-mark${className ? ` ${className}` : ""}`}
      style={{
        height: h,
        width: "auto",
        display: "block",
        mixBlendMode: "screen",
        pointerEvents: "none",
        ...style,
      }}
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      decoding="async"
    />
  );
});

export default OwlMark;
