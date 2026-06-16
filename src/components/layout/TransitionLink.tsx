"use client";

import { navigateWithTransition } from "@/lib/transition-nav";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
}

/**
 * Cross-page link that plays the panel-sweep exit before navigating.
 * Same-page hash links fall through to normal anchor behavior (Lenis
 * handles the smooth scroll), so #contact on the homepage never sweeps.
 */
export default function TransitionLink({ href, children, onClick, ...rest }: TransitionLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let modified clicks (new tab, etc.) behave natively
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const url = new URL(href, window.location.href);
    const samePage = url.pathname === window.location.pathname;
    if (samePage && url.hash) return; // plain anchor scroll

    e.preventDefault();
    navigateWithTransition(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
