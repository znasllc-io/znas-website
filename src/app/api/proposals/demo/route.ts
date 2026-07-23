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

/**
 * Presentation overlay injected only for ?embed=1 (framed viewer). Hides the
 * demo's title/description chrome (keeping the Mobile/Desktop toggle in a slim
 * top bar), drops the page background, and scales the active device to fill the
 * frame at its native aspect ratio. Relies on the demo's stable structure:
 * `.stage-header` (chrome + `.device-toggle`), `.stage`, `.device-stage.active`.
 */
const EMBED_OVERLAY = `
<style id="znas-embed">
  html,body{margin:0!important;background:transparent!important;overflow:hidden!important;height:100%!important;}
  /* Turn the page into a column: a slim toggle bar on top, the app filling the
     rest — so the toggle and the app can never overlap. */
  .page{background:transparent!important;display:flex!important;flex-direction:column!important;height:100vh!important;}
  .stage-header{position:static!important;transform:none!important;flex:0 0 auto!important;display:flex!important;justify-content:center!important;align-items:center!important;width:auto!important;margin:0!important;padding:10px 0!important;}
  .stage-header>*:not(.device-toggle){display:none!important;}
  .stage{flex:1 1 auto!important;min-height:0!important;}
</style>
<script>
(function(){
  // Scale the active device (phone in Mobile, workbench in Desktop) to fill the
  // .stage area at its true aspect ratio. Measuring the stage (not the window)
  // auto-accounts for the toggle bar above it.
  function fit(){
    var stage=document.querySelector('.stage');
    var dev=document.querySelector('.device-stage.active');
    if(!stage||!dev) return;
    dev.style.transform=''; dev.style.transformOrigin='center center';
    var dw=dev.offsetWidth, dh=dev.offsetHeight;
    if(!dw||!dh) return;
    var s=Math.min(stage.clientWidth/dw, stage.clientHeight/dh);
    dev.style.transform='scale('+s+')';
  }
  window.addEventListener('resize', fit);
  function pickDefaultDevice(){
    // Match the default view to the frame shape: a landscape frame opens on the
    // Desktop workbench (which fills it), a portrait frame on the phone. Only
    // acts if the matching toggle exists (phone-only stages have no Desktop).
    try {
      var wantDesktop = window.innerWidth > window.innerHeight;
      var toggle = document.querySelector('.device-toggle');
      if (!toggle) return;
      var re = wantDesktop ? /desktop/i : /mobile/i;
      var btns = [].slice.call(toggle.querySelectorAll('button,[role=button],*'));
      var target = btns.filter(function(b){ return re.test(b.textContent||''); })[0];
      if (target) target.click();
    } catch(e){}
  }
  function boot(){
    pickDefaultDevice();
    var stage=document.querySelector('.stage');
    if(stage){ try{ new MutationObserver(fit).observe(stage,{attributes:true,subtree:true,attributeFilter:['class']}); }catch(e){} }
    fit();
    [80,200,500,1000].forEach(function(t){ setTimeout(fit,t); });
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
</script>
`;

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

  let html = fs.readFileSync(htmlPath, "utf-8");

  // Embed mode (?embed=1): the demo is shown inside the engagement page's
  // framed viewer, where its own title/description are redundant and its
  // viewport-reactive layout overflows a short/wide frame. Inject a presentation
  // overlay that hides the chrome text (keeping the Mobile/Desktop toggle in a
  // slim top bar), drops the page background, and scales the ACTIVE device
  // (phone in Mobile, workbench in Desktop) to fill the frame at its true aspect
  // ratio. The deliverable HTML is never modified on disk — standalone/download
  // views keep the full chrome.
  if (request.nextUrl.searchParams.get("embed") === "1") {
    html = html.replace(/<\/body>/i, `${EMBED_OVERLAY}</body>`);
  }

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
