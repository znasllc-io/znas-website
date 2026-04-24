import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadProposal } from "@/lib/proposals";
import { checkRateLimit } from "@/lib/rate-limit";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";

/** Security headers applied to all responses */
const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, lang } = body as { slug?: string; lang?: string };

    if (!slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Rate limiting (per-slug)
    const rateLimit = checkRateLimit(`download:${slug}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later.", retryAfter: Math.ceil(rateLimit.resetIn / 1000) },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Authenticate via the session cookie issued by /verify. The raw access
    // code no longer travels on download requests. The cookie is HttpOnly
    // and bound to this slug by the JWT payload, so a cookie for proposal A
    // cannot download proposal B even if someone tries to swap the slug in
    // the request body.
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionSlug = await verifySession(token);
    if (!sessionSlug || sessionSlug !== slug) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Load proposal (already authenticated above — this is to fetch the
    // PDF filename mapping, not to re-verify access).
    const proposal = loadProposal(slug);
    if (!proposal) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Pick PDF based on requested language, fall back to English
    const pdfName =
      lang === "es" && proposal.pdfFilenameEs
        ? proposal.pdfFilenameEs
        : proposal.pdfFilename;
    if (!/^[a-z0-9-]+\.pdf$/.test(pdfName)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Resolve PDF path and verify it's within the expected directory (prevent path traversal)
    const pdfsDir = path.resolve(path.join(process.cwd(), "data", "proposals", "pdfs"));
    const pdfPath = path.resolve(path.join(pdfsDir, pdfName));

    if (!pdfPath.startsWith(pdfsDir)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }
}
