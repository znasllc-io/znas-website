import { SignJWT, jwtVerify } from "jose";

/**
 * Proposal session token.
 *
 * Issued by /api/proposals/verify on a successful argon2 check, consumed by
 * /api/proposals/download and anywhere else that needs to confirm the caller
 * already authenticated against a specific proposal slug.
 *
 * Stored in an HttpOnly, Secure, SameSite=Strict cookie so client JS (XSS,
 * extensions, DevTools script-injection) cannot read or exfiltrate it. The
 * access code itself never leaves the initial verify POST.
 */

export const SESSION_COOKIE_NAME = "znas_proposal";
export const SESSION_COOKIE_PATH = "/api/proposals";
export const SESSION_MAX_AGE_SECONDS = 30 * 60; // 30 minutes

const ISSUER = "znas.io";
const AUDIENCE = "znas-proposal-session";

function getSecret(): Uint8Array {
  const raw = process.env.PROPOSAL_SESSION_SECRET;
  if (!raw || raw.length < 32) {
    // Fail loud. A weak or missing secret means anyone can forge session
    // tokens, which would silently bypass the argon2 gate.
    throw new Error(
      "PROPOSAL_SESSION_SECRET env var is required and must be at least 32 characters. " +
        "Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(raw);
}

export async function signSession(slug: string): Promise<string> {
  return new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/**
 * Verify a session token. Returns the slug on success, null on any failure
 * (expired, bad signature, wrong issuer/audience, missing/malformed token).
 * Never throws — the caller gets a single "did this work" boolean-ish.
 */
export async function verifySession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const slug = payload.slug;
    if (typeof slug !== "string") return null;
    return slug;
  } catch {
    return null;
  }
}
