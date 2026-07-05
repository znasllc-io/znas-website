"use client";

/**
 * Module-singleton wiring for the page-transition overlay.
 *
 * PageTransition (mounted once in SiteChrome) registers its exit animation
 * here; any component can call navigateWithTransition(href) to play the
 * panels-cover sweep before navigating — no ref-callback threading.
 *
 * Navigation is a Next.js client-side route change (router.push inside
 * PageTransition), NOT a full page load: the app stays hydrated, fonts and
 * chunks stay warm, and the next page appears as soon as its RSC payload
 * arrives. The sessionStorage flag still marks "arriving via an in-app
 * transition" and survives the odd full load (e.g. target opened in the
 * same tab from history), where the old semantics still apply.
 *
 * consumeTransitionFlag() is the single arbiter of "did we arrive via an
 * in-app transition?". It reads sessionStorage once per arrival, removes
 * the key, applies the reload guard, and caches the answer so both
 * PageTransition (entrance sweep) and HomePreloader (skip decision) see
 * the same value regardless of effect ordering. setTransitionFlag()
 * invalidates the cache so the *next* arrival (full load or client-side)
 * re-reads storage.
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
  // New navigation in flight — the next consume must re-read storage.
  consumedFlag = null;
}

/** Drop a lingering flag (e.g. after a bfcache restore of an interrupted
 * exit) without consuming it as an arrival. */
export function clearTransitionFlag(): void {
  sessionStorage.removeItem(FLAG_KEY);
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
