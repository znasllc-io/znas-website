import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { loadProposal } from "@/lib/proposals";
import { checkRateLimit } from "@/lib/rate-limit";

/** Security headers applied to all responses */
const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, password, lang } = body as { slug?: string; password?: string; lang?: string };

    if (!slug || !password) {
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

    // Load proposal
    const proposal = loadProposal(slug);
    if (!proposal) {
      // Same error as wrong password — prevents slug enumeration
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Constant-time password comparison
    const inputBuf = Buffer.from(password);
    const storedBuf = Buffer.from(proposal.password);

    if (inputBuf.length !== storedBuf.length || !crypto.timingSafeEqual(inputBuf, storedBuf)) {
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
