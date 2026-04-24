import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { loadProposal, toSafeProposal } from "@/lib/proposals";
import { checkRateLimit } from "@/lib/rate-limit";

/** Security headers applied to all responses from this route */
const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, password } = body as { slug?: string; password?: string };

    if (!slug || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Rate limiting (per-slug, not global)
    const rateLimit = checkRateLimit(`verify:${slug}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later.", retryAfter: Math.ceil(rateLimit.resetIn / 1000) },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Load proposal — returns null if slug invalid or file not found
    const proposal = loadProposal(slug);
    if (!proposal) {
      // Return same error shape as wrong password — prevents slug enumeration
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Argon2id verify — constant-time by construction, resists both brute-force
    // (memory-hard) and timing side channels. Throws on malformed hash; we
    // treat any failure as a 401 to avoid leaking hash format details.
    let ok = false;
    try {
      ok = await argon2.verify(proposal.passwordHash, password);
    } catch {
      ok = false;
    }
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Return safe proposal data — password field is stripped by toSafeProposal()
    return NextResponse.json(
      { proposal: toSafeProposal(proposal) },
      { headers: SECURITY_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }
}
