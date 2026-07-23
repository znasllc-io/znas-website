import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadProposal, isAccessExpired } from "@/lib/proposals";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";

/**
 * Gated "Try Now" demo. Serves a proposal's self-contained portal HTML
 * (data/proposals/demos/<demoFilename>) so the viewer can load it in an inline
 * iframe. Same session gate as the PDF download — the HTML never lives in
 * /public, so it can't be reached without the proposal's key.
 *
 * GET (not POST) because it's loaded as an <iframe src>. The slug travels in
 * the query string; the HttpOnly session cookie (issued by /verify and bound
 * to the slug) is what actually authorizes it.
 *
 * Framing headers (SAMEORIGIN / frame-ancestors 'self') override the site-wide
 * X-Frame-Options: DENY so our own origin can embed it. The global header rule
 * in next.config.ts excludes this path so the two don't conflict.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";

  // Deny-by-default response used for every failure — no information leak.
  const deny = () =>
    new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });

  if (!/^[a-z0-9-]+$/.test(slug)) return deny();

  // Rate limit (per-IP+slug), same as the download endpoint.
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({ ip, slug });
  if (!rateLimit.allowed) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  }

  // Authenticate via the slug-bound session cookie.
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionSlug = await verifySession(token);
  if (!sessionSlug || sessionSlug !== slug) return deny();

  const proposal = loadProposal(slug);
  if (!proposal) return deny();

  // Optional ?demo=<id> selects one of proposal.demos[]; without it we serve
  // the single legacy demoFilename. Unknown/malformed ids deny (no leak).
  const demoId = request.nextUrl.searchParams.get("demo");
  let demoFilename: string | undefined;
  if (demoId !== null) {
    if (!/^[a-z0-9-]+$/.test(demoId)) return deny();
    demoFilename = proposal.demos?.find((d) => d.id === demoId)?.filename;
  } else {
    demoFilename = proposal.demoFilename;
  }
  if (!demoFilename || !/^[a-z0-9-]+\.html$/.test(demoFilename)) return deny();

  // Access-window check on every load: a session minted minutes before the
  // deadline must not keep serving the demo after it passes.
  if (isAccessExpired(proposal)) return deny();

  // Resolve within data/proposals/demos and verify no path traversal.
  const demosDir = path.resolve(path.join(process.cwd(), "data", "proposals", "demos"));
  const htmlPath = path.resolve(path.join(demosDir, demoFilename));
  if (!htmlPath.startsWith(demosDir + path.sep) || !fs.existsSync(htmlPath)) return deny();

  const html = fs.readFileSync(htmlPath, "utf-8");

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Allow our own origin to frame this (overrides the site-wide DENY,
      // which is excluded for this path in next.config.ts).
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
