"use client";

import { useRef } from "react";
import { useSplitReveal } from "@/hooks/useGsapReveal";

interface SplitHeadlineProps {
  children: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Headline that compiles in character-by-character on scroll (see
 * `useSplitReveal`). Drop-in replacement for an `<h2 className="fde-headline">`.
 *
 * Keyed by its text so it cleanly remounts on language toggle — the safe
 * React + SplitText pattern (avoids React reconciling against SplitText's
 * injected char spans).
 */
export default function SplitHeadline({
  children,
  as: Tag = "h2",
  className,
  style,
}: SplitHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  useSplitReveal(ref, [children]);

  return (
    <Tag key={children} ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
