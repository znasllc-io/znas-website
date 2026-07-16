import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for proposal access endpoints.
 *
 * Two dimensions are enforced simultaneously:
 *
 *   - Per-IP+slug (10 req / minute, sliding window): throttles a single
 *     attacker trying to brute-force a specific proposal. A determined
 *     attacker from a different IP is on their own bucket, so this does
 *     NOT lock out the legitimate client the way a global-per-slug
 *     limit does.
 *
 *   - Per-slug (100 req / hour, sliding window): an abuse ceiling that
 *     catches distributed credential-stuffing against a single proposal.
 *     Tuned permissive enough that one real client in a normal session
 *     will never touch it (each login + a few downloads is ~5 requests).
 *     Tripping this is a strong signal something is wrong — future
 *     follow-up should emit a structured log + alert at that moment
 *     (audit finding M2).
 *
 * The video streaming route uses a separate, much more permissive limiter
 * (see checkStreamRateLimit below) instead of the one above: it's already
 * gated behind the session cookie (verifySession), so the brute-force
 * concern the tight 10/min budget defends against doesn't apply, and a
 * single playthrough of a range-chunked video legitimately needs far more
 * than 10 requests/minute.
 *
 * Two runtime modes:
 *
 *   - Distributed (preferred for prod): if UPSTASH_REDIS_REST_URL +
 *     UPSTASH_REDIS_REST_TOKEN are set, state lives in Upstash Redis.
 *     Counters survive restarts and are shared across replicas, so
 *     N-instance deployments don't give attackers N× the attempts.
 *
 *   - In-memory fallback (dev, single-instance): if those env vars are
 *     not set we fall back to a local Map. Good enough for `next dev`
 *     and single-container deployments; must NOT be the production mode
 *     behind a load balancer.
 *
 * Both modes use the same (ip+slug, slug) key scheme, so the correctness
 * of the per-IP isolation carries over — the only thing that degrades
 * without Redis is cross-replica sharing.
 */

const MAX_PER_IP_PER_MIN = 10;
const MAX_PER_SLUG_PER_HOUR = 100;

// Streaming needs many more, smaller requests per viewing than an auth
// attempt does (the video route caps each response to MAX_CHUNK bytes), so
// it gets its own, more permissive budget instead of sharing the one above.
const MAX_STREAM_PER_IP_PER_MIN = 300;
const MAX_STREAM_PER_SLUG_PER_HOUR = 6000;

const redisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let perIpLimiter: Ratelimit | null = null;
let perSlugLimiter: Ratelimit | null = null;
let streamIpLimiter: Ratelimit | null = null;
let streamSlugLimiter: Ratelimit | null = null;

if (redisConfigured) {
  const redis = Redis.fromEnv();
  perIpLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_PER_IP_PER_MIN, "60 s"),
    prefix: "rl:ip",
    analytics: false,
  });
  perSlugLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_PER_SLUG_PER_HOUR, "3600 s"),
    prefix: "rl:slug",
    analytics: false,
  });
  streamIpLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_STREAM_PER_IP_PER_MIN, "60 s"),
    prefix: "rl:stream:ip",
    analytics: false,
  });
  streamSlugLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_STREAM_PER_SLUG_PER_HOUR, "3600 s"),
    prefix: "rl:stream:slug",
    analytics: false,
  });
}

interface MemBucket {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, MemBucket>();

function memCheck(key: string, max: number, windowMs: number): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  // Opportunistic cleanup so the map doesn't grow unbounded under abuse
  if (memStore.size > 1000) {
    for (const [k, v] of memStore) if (now > v.resetAt) memStore.delete(k);
  }
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetIn: windowMs };
  }
  if (entry.count >= max) {
    return { allowed: false, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, resetIn: entry.resetAt - now };
}

/**
 * Extract the client IP from proxy headers.
 *
 * This deploys behind Cloud Run: Google's front end APPENDS the real
 * client IP to whatever X-Forwarded-For the client sent, so the
 * trustworthy value is the LAST entry. Taking the first entry (the old
 * behavior) let an attacker send their own X-Forwarded-For and rotate
 * per-IP rate-limit buckets at will.
 *
 * If the server is ever exposed directly to the internet, this MUST be
 * replaced with the connection-level remote address.
 */
export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function checkRateLimit(args: {
  ip: string;
  slug: string;
}): Promise<{ allowed: boolean; resetIn: number }> {
  const { ip, slug } = args;

  if (perIpLimiter && perSlugLimiter) {
    const [ipResult, slugResult] = await Promise.all([
      perIpLimiter.limit(`${ip}:${slug}`),
      perSlugLimiter.limit(slug),
    ]);
    const allowed = ipResult.success && slugResult.success;
    const resetIn = Math.max(0, Math.max(ipResult.reset, slugResult.reset) - Date.now());
    return { allowed, resetIn };
  }

  // In-memory path. Check the per-IP bucket first so a single attacker
  // can't consume the global slug budget by spamming — they hit their
  // own per-IP limit well before that.
  const ipCheck = memCheck(`ip:${ip}:${slug}`, MAX_PER_IP_PER_MIN, 60_000);
  if (!ipCheck.allowed) return ipCheck;
  const slugCheck = memCheck(`slug:${slug}`, MAX_PER_SLUG_PER_HOUR, 3_600_000);
  if (!slugCheck.allowed) return slugCheck;
  return { allowed: true, resetIn: Math.min(ipCheck.resetIn, slugCheck.resetIn) };
}

/**
 * Rate limit for the gated video streaming route only. Same IP+slug /
 * slug-wide shape as checkRateLimit, but with a budget sized for many
 * range-chunked requests per viewing rather than a handful of auth
 * attempts (see the module comment above).
 */
export async function checkStreamRateLimit(args: {
  ip: string;
  slug: string;
}): Promise<{ allowed: boolean; resetIn: number }> {
  const { ip, slug } = args;

  if (streamIpLimiter && streamSlugLimiter) {
    const [ipResult, slugResult] = await Promise.all([
      streamIpLimiter.limit(`${ip}:${slug}`),
      streamSlugLimiter.limit(slug),
    ]);
    const allowed = ipResult.success && slugResult.success;
    const resetIn = Math.max(0, Math.max(ipResult.reset, slugResult.reset) - Date.now());
    return { allowed, resetIn };
  }

  const ipCheck = memCheck(`streamip:${ip}:${slug}`, MAX_STREAM_PER_IP_PER_MIN, 60_000);
  if (!ipCheck.allowed) return ipCheck;
  const slugCheck = memCheck(`streamslug:${slug}`, MAX_STREAM_PER_SLUG_PER_HOUR, 3_600_000);
  if (!slugCheck.allowed) return slugCheck;
  return { allowed: true, resetIn: Math.min(ipCheck.resetIn, slugCheck.resetIn) };
}
