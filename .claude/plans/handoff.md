# Handoff — ZNAS Website

Last updated: 2026-04-23

## Who's working on this

- **Kike** (Jesus Mendivil, `jmendivil@visionarys.io`) — primary operator, the person you talk to in-session
- **José Sanz** — owner of ZNAS LLC, reviews and approves work. He tests on Safari/Brave; Kike tests on Chromium in preview.
- **Majo** (María José Zepeda) — ops, not directly in the loop for code

**⚠️ CONFIDENTIALITY:** This is ZNAS LLC work, NOT Visionarys. Only the three people above know about ZNAS. Do **NOT** involve, reference, or escalate to Sawyer, Santiago, or any other Visionarys team member. If escalation is needed, it goes to Kike or José.

## What the site is

Personal portfolio + client proposal portal for José Sanz at `znas.io`.

- **Home page** (`/`) — portfolio with hero, about, expertise, journey, work, testimonials, contact
- **Proposals list** (`/proposals`) — clients click their name, enter UUID inline, navigate to detail. No footer.
- **Proposal detail** (`/proposals/[slug]`) — themed proposal viewer with roadmap, timeline, pricing, PDF download (EN + ES)

## Tech stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- GSAP + Lenis for animations (Lenis disabled on mobile and `prefers-reduced-motion`)
- Tailwind v4 + custom CSS variables
- Dockerfile → Cloud Run via GitHub Actions (`deploy-cloud-run.yml`)
- Static file-based data for proposals — no database
- React Context (`LanguageProvider`) + typed dictionary for i18n — no external library

## Repo + deployment

- GitHub: `znasllc-io/znas-website`. Account `jmendivilznas` has push via `gh` CLI (HTTPS)
- Every push to `main` triggers `.github/workflows/deploy-cloud-run.yml` → Cloud Run (us-central1). Deploys in ~2 min.
- Check status: `gh run list --limit 1`

## Git workflow (non-negotiable)

1. Small fixes go direct to `main`. Larger features on `fix/*` or `feature/*` branches.
2. Commit locally as you go.
3. **Do NOT push without Kike's explicit approval** — he'll say "push it" / "lets merge" / "push to main".
4. For branched work: push, `gh pr create`, then `gh pr merge N --merge --delete-branch`.
5. Never force-push to main. Never use `--no-verify`. Never skip hooks.

## Current state (as of this handoff)

All work pushed to `main`. Latest commit: `d4be6d7` (fix: watchdog interval on home to detect + reload stuck preloader).

### 🚨 OPEN BUG — Preloader stuck on browser-back from /proposals

**Symptom:** User clicks Proposals, then hits the browser back arrow (not the owl or Back button). Home loads but the preloader is stuck: black panels cover the viewport, "000" counter visible in the middle, no owl logo, no loading bar, no animation. Stays stuck indefinitely.

**What's been tried (all shipped to main, all failed on Kike's Brave + my dev preview):**

1. **Flag-based detection on /proposals mount** — `sessionStorage.setItem("znas-page-transition", "1")` so browser-back carries the flag. Flag IS set correctly; not enough to fix alone.
2. **`pageshow` event handler with reload** — on bfcache restore with flag set, `window.location.reload()`. Never fires because Next.js soft-nav doesn't trigger pageshow.
3. **`popstate` handler** on home that reloads when path="/" and flag="1". Handler doesn't fire (Next.js intercepts popstate for its router) or runs but reload doesn't happen.
4. **`unload` listener** on proposal pages to disable Chromium bfcache. Didn't help.
5. **`Cache-Control: no-store` response header** on `/` (via `next.config.ts`). PRODUCTION-ONLY — dev server ignores this. Unknown if it works on production (not verified yet).
6. **Remove `preloaderDone` gate from Hero** so Hero animates on mount regardless of preloader state. Shipped, should at least eliminate the "post-preloader black flash".
7. **Watchdog `setInterval` on home** — every 400ms checks if counter shows "000" at opacity 1 while flag is set, and reloads if stuck. Has a one-shot reload guard to prevent loops. **This is the current last-resort fix shipped in `d4be6d7`.**

**The core diagnostic** from my preview-tool investigation:
- After calling `history.back()` from /proposals, `performance.now()` values continue from before (no reset). This means the JS context never restarted.
- Preloader's `useEffect` does NOT re-run on browser back.
- The Preloader DOM ends up in a `pointer-events: none` state (from previous run's onComplete) but with panels at `transform: none` (initial) and counter at opacity 1 text "000" (initial). It looks "reset" but never animated.
- Multiple `sessionStorage` reads happening in parallel return different values (null/"1"/empty string), suggesting multiple React contexts or Strict Mode + HMR interactions in dev.

**Where the bug likely lives:** either in Next.js App Router's soft-nav behavior when combined with `window.location.href` for forward navigation, or in bfcache handling, or a combination. I was unable to root-cause it with the tools available to me (Claude Preview MCP).

**What to try next:**
- Have Kike/José actually verify on deployed `znas.io` (post-`d4be6d7` deploy). The `Cache-Control: no-store` header takes effect only in production — NEVER verified yet whether that alone fixes it.
- Next.js 16 may be using view transitions or the new partial prerendering behavior. Check `next.config.ts` for `experimental` flags and turn them off.
- Strongly consider: remove the preloader entirely on return (don't try to animate it, just skip it). Kike said the preloader-on-return was Jose's idea, but the implementation has been so painful that it may not be worth it.
- If all else fails, tell Kike honestly: "this requires a debugger on your browser I don't have, consider hiring someone who can." He respects honesty over guacamole.

**Critical files for this bug:**
- `src/components/layout/Preloader.tsx` — short/full animation, pageshow handler
- `src/components/layout/PageTransition.tsx` — consumes the flag, plays/skips reveal
- `src/components/proposals/ProposalListClient.tsx` — sets flag on mount + unload listener
- `src/components/proposals/ProposalPageClient.tsx` — same
- `src/app/page.tsx` — popstate + watchdog interval
- `src/components/sections/Hero.tsx` — preloaderDone gate removed from useEffects
- `next.config.ts` — Cache-Control: no-store on `/`

---

## What's been done (good state)

### i18n (complete)
- `src/lib/language.tsx` — `LanguageProvider` + `useLanguage()` hook, persists to `localStorage["znas-lang"]`
- `src/lib/translations.ts` — typed EN+ES dictionary covering every user-facing string
- Language toggle button right of theme toggle. Both 36×36 square. Shows the *other* language ("ES" in EN mode, "EN" in ES mode).
- Alebrije proposal has `sections_es` + `projectTitle_es`. Viewer picks Spanish variant when `lang === "es"`.
- Download API reads `lang` from body → returns `alebrijes-en.pdf` or `alebrijes-es.pdf`. Files named `Alebrijes_EN.pdf` / `Alebrijes_ES.pdf` on download.
- Comprehensive proofreading pass done (~130 Spanish accent corrections, Spanish months lowercased, `¿` inverted marks, "Jose" → "José" in Spanish only, "José" not used in English).
- **Alebrije PDFs canonical source**: `pdf files/files /` (note trailing space in folder name). Do NOT use the root-level PDFs or `pdf files/` directly — Kike puts updated ZIPs into the subfolder.

### Work section (complete)
- CoPresent: new "co-presence workspace" copy. URL: `https://visionarys.io/copresent`. Modal shows "Visit the website" for non-GitHub URLs.
- MemQL: new "AI-native DSL on distributed time-series memory graph" copy.
- CHALLENGE / APPROACH / IMPACT labels bumped: 0.8rem, opacity 1, font-weight 600.
- Code-comment tooltips (hover easter eggs) mapped by title, not index.

### Safari perf fixes (shipped)
- Removed `will-change: backdrop-filter` + transition on `.nav` (root of reported 5s Safari freeze)
- Removed `gsap.ticker.lagSmoothing(0)` in `useLenis.ts`
- Removed permanent `will-change` on `.synapse-dot` and `.flip-clock-char > span`
- Deleted `GrainOverlay` component entirely (SVG feTurbulence was CPU-bound)
- Hero ambient glow: static (kept blur for soft edges, removed 20s drift animation)
- **Top 4 remaining heavy items** (if perf is still an issue): Hero magnetic nodes (SVG line recalc every mousemove), CustomCursor + blur tooltip, Lenis ↔ ScrollTrigger coupling, stacked backdrop-filter surfaces (nav, modal, status popup, password gate).

### Navigation / UX
- Owl logo = universal home button (scroll-to-top on home, navigate-to-/ elsewhere)
- Theme + language toggles normalized to 36×36 square
- "2 clients in queue" dropped from availability popup
- FlipClock baseline alignment fixed (Contact section on mobile): `vertical-align: baseline` on `.flip-clock-char` + word wrapper
- Footer removed from `/proposals` selection page
- `.work-row { cursor: none }` moved inside `@media (pointer: fine)` guard (CSS hygiene)

## Critical files

| File | Purpose |
|------|---------|
| `src/lib/language.tsx` | LanguageProvider + `useLanguage()` hook |
| `src/lib/translations.ts` | Typed EN+ES strings dictionary |
| `src/components/layout/Navigation.tsx` | Unified nav. Props: `visible`, `variant` (`"home"` \| `"portal"`), `backHref`, `backLabel`, `navOverride`. Owl logo = universal home button |
| `src/components/layout/Footer.tsx` | Unified footer (not rendered on `/proposals` selection page) |
| `src/components/layout/Preloader.tsx` | **Active bug area.** Short + full animation paths. Has `handlePageShow` for bfcache. |
| `src/components/layout/PageTransition.tsx` | Panel-split animation. On home, if flag set, skips reveal (Preloader handles it). |
| `src/components/proposals/ProposalListClient.tsx` | Inline code entry. Sets `znas-page-transition` on mount. Adds `unload` listener. |
| `src/components/proposals/ProposalPageClient.tsx` | Detail page wrapper. Same flag behavior. Passes `lang` to download API. |
| `src/components/proposals/ProposalViewer.tsx` | Proposal content. Picks `sections_es` and `projectTitle_es` when `lang === "es"` |
| `src/components/ui/ProjectModal.tsx` | Modal for work cards. `PROJECT_URLS` maps title → URL. Button swaps GitHub vs Website. |
| `data/proposals/alebrije.json` | Proposal content (EN `sections` + ES `sections_es`, `projectTitle_es`, PDF filenames) |
| `data/proposals/pdfs/alebrijes-en.pdf` / `alebrijes-es.pdf` | Downloadable PDFs. **Canonical source: `pdf files/files /` (folder has trailing space).** |
| `src/lib/proposals.ts` | Server-side loader with slug sanitization + `path.resolve` guard |
| `src/lib/rate-limit.ts` | In-memory rate limiter (5 attempts/slug/minute, per-IP) |
| `src/app/api/proposals/verify/route.ts` | POST auth, `crypto.timingSafeEqual`, identical errors (no slug enumeration) |
| `src/app/api/proposals/download/route.ts` | POST auth + streams PDF; picks EN or ES via `lang` in body |
| `src/app/page.tsx` | Home page. Has the **watchdog interval** (active bug fix attempt) |
| `src/hooks/useLenis.ts` | Lenis smooth-scroll (no `lagSmoothing(0)` — let GSAP throttle) |
| `next.config.ts` | `Cache-Control: no-store` on `/` (prod only, disables bfcache) |

## Known test credentials

- **Slug**: `alebrije`
- **UUID**: `550e8400-e29b-41d4-a716-446655440000`
- **Client**: Alebrije 741 Wellness Padel Club (client owner: José Delgado)

## Security posture

- No proposal data in initial HTML / RSC payload
- Constant-time password comparison (`crypto.timingSafeEqual`)
- Identical 401 errors for slug-not-found vs wrong-password (no slug enumeration)
- PDFs outside `/public/`, served via auth-gated API
- Per-slug rate limiting (5/min, resets on deploy — in-memory)
- Security headers on API responses (`no-store`, `nosniff`, etc.)
- Slug sanitization (`[a-z0-9-]+`) + `path.resolve` containment
- **Moderate risk flagged**: sessionStorage stores plaintext password after auth (`znas-proposal-${slug}`). Not exploitable without an XSS, but an XSS anywhere on the site would grant an attacker the proposal + password. Mitigation: switch to a server-signed short-lived token. Not urgent. See `.claude/plans/handoff.md` git history.

## Workflow preferences Kike has expressed

- Uses named agents (Foundry, Welder, Magnetron, etc.) for parallel dev work
- Likes QA / security audit agents to verify work
- Wants visual verification via screenshots before declaring done
- Prefers fewer larger commits over many tiny ones. Direct-to-main is OK for small work.
- Tests locally before approving push/merge
- Wants explicit confirmation before pushing
- **Hates em dashes (—) and en dashes (–)** — reads as "AI-looking". Use commas, periods, pipes, colons, or parens instead. This has been reinforced multiple times.
- Calls himself "not super technical with GitHub" — explain git concepts when relevant
- Uses M4 Max with 64GB RAM. Tests in Low Power Mode to surface perf issues for typical visitors.
- **Browser reality**: Claude Preview MCP runs Chromium. Kike uses Brave. José uses Safari. Several issues have been Safari-specific (5s freeze from backdrop-filter, FlipClock baseline, current preloader bug) — always consider Safari / non-Chromium quirks.
- **Kike values honesty over guacamole.** If you can't fix something, say so clearly. He explicitly said: "Try this way or just tell me outright I can't fix this and I'll find someone else that will." Don't pretend you've fixed something when you haven't verified it.

## How to resume

1. Read this file
2. `git status && git log --oneline -10` to see state
3. `gh pr list --state all --limit 5` for PR history
4. Dev server: `npm run dev` (Turbopack; if HMR gets stuck, `rm -rf .next && npm run dev`)
5. Always verify TypeScript: `npx tsc --noEmit`
6. For visual work, Claude Preview MCP at mobile (375×812) and desktop (1280+)
7. Use `preview_eval` for computed-style inspection — more reliable than screenshots for font sizes, baselines, colors
8. For testing authenticated proposal views:
   ```js
   (async () => {
     const res = await fetch("/api/proposals/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: "alebrije", password: "550e8400-e29b-41d4-a716-446655440000" }) });
     const data = await res.json();
     sessionStorage.setItem("znas-proposal-alebrije", JSON.stringify({ proposal: data.proposal, password: "550e8400-e29b-41d4-a716-446655440000" }));
     localStorage.setItem("znas-lang", "es"); // or "en"
     window.location.href = "/proposals/alebrije";
   })();
   ```

## PDF update workflow (when Kike drops new PDFs)

Kike unzips PDFs into `pdf files/files /` (trailing space on folder). Verify BYTE-FOR-BYTE before pushing:

```bash
# 1. Compare source vs deployed
md5 "pdf files/files /ZNAS_x_Alebrije_Proposal_EN.pdf"
md5 "pdf files/files /ZNAS_x_Alebrije_Propuesta_ES.pdf"
md5 data/proposals/pdfs/alebrijes-en.pdf
md5 data/proposals/pdfs/alebrijes-es.pdf

# 2. Copy
cp "pdf files/files /ZNAS_x_Alebrije_Proposal_EN.pdf" data/proposals/pdfs/alebrijes-en.pdf
cp "pdf files/files /ZNAS_x_Alebrije_Propuesta_ES.pdf" data/proposals/pdfs/alebrijes-es.pdf

# 3. Verify MD5 matches post-copy
# 4. Live API test in preview:
#    POST /api/proposals/download with lang="en" and lang="es", hash the blob, compare SHA256.
# 5. Commit + push
```

Kike has called this out multiple times as a "triple-check the first time" concern — skip the guacamole, verify all 3 layers (source → on-disk → API-served) match via hash before declaring done.

## Recent commit history (direct-to-main)

| Commit | Description |
|--------|-------------|
| `d4be6d7` | fix: watchdog interval on home to detect + reload stuck preloader **(active bug, unverified)** |
| `ddf6ab0` | fix: multiple defenses against stuck preloader on browser-back |
| `85fb6a6` | fix: fire preloader onComplete early so Hero animates behind panels |
| `03a87a8` | fix: force hard reload on bfcache restore to /proposals return |
| `247714a` | fix: browser-back from /proposals also shows short preloader |
| `6f5ae46` | fix: show short preloader when returning from /proposals (Jose's fix) |
| `95bc48e` | copy: drop "2 clients in queue" from availability popup |
| `61e025e` | fix: Work card code-comment tooltips mismatched with project order |
| `0361c41` | content: update Alebrije EN + ES proposal PDFs (round 2) |
| `e4a234f` | fix: Safari baseline misalignment on FlipClock (remove overflow:hidden) |
| `8885527` | content: update Alebrije EN + ES proposal PDFs |
| `bc75745` | feat+perf: work copy rewrite, Safari perf fixes, mobile polish |
| `95bc48e` | copy: drop "2 clients in queue" from availability popup |
| `90209fc` | fix: comprehensive Spanish/English copy proofreading pass |
| `0b8b3ba` | feat: translate proposal projectTitle to Spanish |
| `7f6ae95` | fix: use correct EN PDF from pdf files folder |
| `1aa73ba` | fix: replace EN PDF with correct version, rename proposal PDFs |
| `fc9944c` | feat: site-wide EN/ES translation system + Alebrije proposal update |

## Recent PR history (earlier branched work)

| PR | Branch | Description | Status |
|----|--------|-------------|--------|
| #1 | feature/flip-clock-magnetic-nodes | Flip clock + magnetic nodes | Merged |
| #2 | fix/perf-bugs-and-polish | Memory leaks, React.memo, theme toggle | Merged |
| #3 | feature/proposal-portal | Password-protected proposal portal | Merged |
| #4 | fix/jose-feedback-round1 | José's feedback round 1 | Merged |
| #5 | fix/mobile-responsive | Mobile portrait + landscape responsive fixes | Merged |
| #6 | fix/visual-consistency | Unified header/footer, inline code entry | Merged |

## Low-priority / untracked cleanup

- Several stale PDFs in repo root (`ZNAS_x_Alebrije_Proposal_EN.pdf`, `ZNAS_x_Alebrije_Proposal_FINAL*.pdf`, etc.) — can be deleted
- `Untitled-2.png`, `znas-out.zip`, `agent-output/` — junk, can be deleted
- `pdf files/` — keep, authoritative source for Alebrije PDFs
- `.claude/plans/*.md` — keep
- Code-comment tooltip at `Navigation.tsx` accent color picker aria-labels still English-only (low-priority i18n gap)
- Aria-labels on testimonials prev/next buttons, modal close buttons, etc., still English-only
