---
name: verify
description: Build, run, and drive the znas.io site to verify changes end-to-end (desktop + iPhone viewports, no-JS failsafes, soft navigation).
---

# Verify znas-website

## Build & launch

```bash
npm run build                      # Next 16 / Turbopack; tsc runs inside the build
npx next start --port 3111 &      # serve the production build
curl -s -o /dev/null -w "%{http_code}" http://localhost:3111/
```

Dev server (`npm run dev`) behaves differently (Strict Mode double-effects,
no static prerender) — always verify against `next start`.

## Drive it (Playwright + system Chrome, no browser download)

```bash
cd <scratchpad> && npm i playwright && node drive.mjs
# chromium.launch({ channel: "chrome", headless: true })
```

Flows that matter, in priority order:

1. **/ (home)** — preloader plays once (~2.7s), hero appears with Archivo 900
   headline. Fonts: `document.fonts.check("900 20px Archivo")` etc. Clash
   Display only loads on pages that use it (/portfolio, proposals) — checking
   it on home returns false by design.
2. **Soft navigation** — click `nav a[href="/portfolio"]`; assert
   `performance.getEntriesByType("navigation").length === 1` after the URL
   changes (full reload would reset it). TransitionLink → PageTransition
   (panel sweep on desktop, instant on touch) → router.push.
3. **/portfolio hero** — after ~3s, `.hero-content`/`.hero-diagram` computed
   opacity must be 1. Screenshot mid-entrance shows partial content; that's
   choreography, not a bug.
4. **No-JS failsafes** (the iPhone-Safari bug class) — context with
   `javaScriptEnabled: false`: /portfolio `.hero-content` opacity → 1 by
   ~2.2s (`.fouc-guard` CSS animation), home `.fde-reveal` → 1 by ~2.9s.
5. **Browser back** after soft nav — no covering panels (zIndex 99998 divs
   parked off-screen), no preloader replay, no console errors.
6. **Reduced motion** — `reducedMotion: "reduce"` context: hero visible
   almost immediately, no pulse tweens.
7. **ES toggle** — `button[aria-label="Switch to Spanish"]`: content flips
   AND `document.documentElement.lang === "es"`.

iPhone viewport: 393×852, `isMobile: true, hasTouch: true`, iOS UA.

## Gotchas

- Panels + preloader are the historical bug source: any change near
  PageTransition/HomePreloader/transition-nav must re-run flows 2, 4, 5.
- Headers to spot-check: `/fonts/*` → `immutable`; `/` must NOT be
  `no-store` (kills bfcache).
- Fonts are self-hosted in /public/fonts, declared in globals.css
  @font-face. If a font family renders as fallback sans, check the built
  CSS in .next/static/chunks/*.css for the /fonts/ URLs (Turbopack once
  silently dropped external @imports).
