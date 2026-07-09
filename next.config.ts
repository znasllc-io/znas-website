import type { NextConfig } from "next";

/**
 * Content-Security-Policy. Shipped in Report-Only mode first (see H2
 * follow-up) so any violation from Next.js internals or future component
 * changes shows up in browser consoles / report endpoints without breaking
 * the page. Promote to the enforcing `Content-Security-Policy` header
 * after 48 hours of clean observation in production.
 *
 * Allowlisted external origins (verified against the codebase — grep for
 * https:// returns only these):
 *   - api.fontshare.com, cdn.fontshare.com — Fontshare webfonts (Clash
 *     Display + General Sans, imported in globals.css).
 *   - fonts.googleapis.com, fonts.gstatic.com — Google Fonts (JetBrains
 *     Mono, imported in globals.css).
 *
 * script-src is intentionally 'self' with no 'unsafe-inline'. Next.js
 * App Router may emit small inline scripts (hydration preamble). If
 * Report-Only mode surfaces violations from Next internals, the correct
 * next step is nonce-based CSP via middleware rather than relaxing this
 * directive — tracked as a separate follow-up.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
  "font-src 'self' data: https://cdn.fontshare.com https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // Legacy URL → new canonical route. The user-facing section was
      // renamed from "Proposals" to "Engagements" but external links Jose
      // shared (e.g. /proposals/haven) need to keep resolving. Permanent
      // redirect preserves SEO and tells browsers to update their cache.
      // API routes (/api/proposals/*) and internal storage (data/proposals/,
      // session cookie path) intentionally stay on the old name — they're
      // not user-facing and renaming them would invalidate active sessions.
      {
        source: '/proposals',
        destination: '/engagements',
        permanent: true,
      },
      {
        source: '/proposals/:slug',
        destination: '/engagements/:slug',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Everything EXCEPT the gated Try-Now demo (which our own origin must
        // be able to iframe — see the dedicated rule below). DENY here would
        // otherwise stop the browser from framing it.
        source: '/((?!api/proposals/demo).*)',
        headers: [
          // Legacy clickjacking protection. CSP frame-ancestors supersedes
          // this on modern browsers but both are kept for defense-in-depth.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HSTS: 1 year, no includeSubDomains/preload yet. Strengthen to
          // `max-age=63072000; includeSubDomains; preload` + submit to
          // hstspreload.org once every subdomain is confirmed HTTPS-only
          // (irreversible — takes years to unwind).
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          // Isolate the browsing context from other origins (Spectre-class
          // side-channel mitigation, enables cross-origin isolation).
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Content-Security-Policy in REPORT-ONLY mode. Violations are
          // reported in the browser console / report endpoint but the
          // request is not blocked. Promote to enforcing after 48h clean.
          { key: 'Content-Security-Policy-Report-Only', value: CSP },
        ],
      },
      {
        // Gated Try-Now demo: same security posture as the rest, but framable
        // by our own origin so the proposal viewer can embed it in an iframe.
        // The route handler also sets X-Frame-Options: SAMEORIGIN + CSP
        // frame-ancestors 'self' on its response; this keeps the other
        // hardening headers (nosniff, referrer, permissions, HSTS) in place.
        source: '/api/proposals/demo',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
      {
        // Disable bfcache on home so the Preloader always mounts fresh
        // when users navigate back from /engagements. Without this, bfcache
        // restores Home's cached DOM in a pre-useEffect state (panels
        // covering, "000" counter visible) and the preloader never plays.
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
