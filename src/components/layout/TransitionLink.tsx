"use client";

import Link from "next/link";
import { navigateWithTransition } from "@/lib/transition-nav";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
}

/**
 * Cross-page link that plays the panel-sweep exit before navigating.
 * Built on next/link so destinations are prefetched when the link scrolls
 * into view — the actual navigation is a client-side route change and feels
 * instant. Same-page hash links smooth-scroll in place (no route change).
 */
export default function TransitionLink({ href, children, onClick, ...rest }: TransitionLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let modified clicks (new tab, etc.) behave natively
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const url = new URL(href, window.location.href);
    const samePage = url.pathname === window.location.pathname;
    if (samePage && url.hash) {
      // In-page anchor: scroll smoothly, no transition sweep.
      e.preventDefault();
      document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    e.preventDefault();
    navigateWithTransition(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
