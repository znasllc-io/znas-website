"use client";

/**
 * Module-singleton wiring for the page-transition overlay.
 *
 * PageTransition (mounted once in SiteChrome) registers its exit animation
 * here; any component can call navigateWithTransition(href) to play the
 * panels-cover sweep before a full navigation — no ref-callback threading.
 *
 * consumeTransitionFlag() is the single arbiter of "did we arrive via an
 * in-app transition?". It reads sessionStorage exactly once per page load,
 * removes the key, applies the reload guard, and caches the answer so both
 * PageTransition (entrance sweep) and HomePreloader (skip decision) see the
 * same value regardless of effect ordering.
 */

const FLAG_KEY = "znas-page-transition";

let triggerExit: ((href: string) => void) | null = null;
let consumedFlag: boolean | null = null;

export function registerTriggerExit(fn: (href: string) => void): void {
  triggerExit = fn;
}

export function navigateWithTransition(href: string): void {
  if (triggerExit) triggerExit(href);
  else window.location.href = href;
}

export function setTransitionFlag(): void {
  sessionStorage.setItem(FLAG_KEY, "1");
}

export function consumeTransitionFlag(): boolean {
  if (consumedFlag !== null) return consumedFlag;

  const flagSet = !!sessionStorage.getItem(FLAG_KEY);

  // Hard refresh / browser reload should NOT count as an in-app arrival:
  // the flag survives reloads, but a reload is the user asking for a fresh
  // page, not the tail end of a navigation.
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const isReload = navEntry?.type === "reload";

  sessionStorage.removeItem(FLAG_KEY);
  consumedFlag = flagSet && !isReload;
  return consumedFlag;
}
