import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { loadProposal, isAccessExpired, resolveAssetPath } from "@/lib/proposals";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";

/**
 * Gated download for a proposal's "Assets" deliverables — PDFs, the portal
 * HTML, and (later) videos/images. Same gate as the PDF download endpoint:
 * the HttpOnly session cookie must be bound to this slug, the access window
 * must still be open, and the served path is resolved from the proposal's own
 * declared assets[] (never from client input) and containment-checked inside
 * data/proposals/.
 *
 * Everything is sent with Content-Disposition: attachment + nosniff, so files
 * download rather than render (the HTML never executes in our origin).
 */

const SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".htm": "text/html",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".zip": "application/zip",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, assetId } = body as { slug?: string; assetId?: string };

    if (!slug || !assetId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit({ ip, slug });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later.", retryAfter: Math.ceil(rateLimit.resetIn / 1000) },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Authenticate via the slug-bound session cookie.
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionSlug = await verifySession(token);
    if (!sessionSlug || sessionSlug !== slug) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const proposal = loadProposal(slug);
    if (!proposal) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Access window closed → deny (same as the other gated routes).
    if (isAccessExpired(proposal)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Validate the id shape, then look the asset up in THIS proposal's own
    // declared list — the file path is server-controlled, never client input.
    if (!/^[a-z0-9-]+$/.test(assetId)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }
    const asset = proposal.assets?.find((a) => a.id === assetId);
    if (!asset) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Resolve + containment-check within data/proposals/ (defense in depth).
    const assetPath = resolveAssetPath(asset.file);
    if (!assetPath || !fs.existsSync(assetPath)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const ext = path.extname(assetPath).toLowerCase();
    const contentType = CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream";

    // Downloaded filename: explicit downloadName, else the on-disk basename.
    // Sanitized to the safe pattern so it can't smuggle header characters.
    let downloadName = asset.downloadName || path.basename(assetPath);
    if (!/^[A-Za-z0-9._-]+$/.test(downloadName)) downloadName = path.basename(assetPath);

    // Stream the file as a true chunked response — and deliberately DO NOT set
    // Content-Length. On Cloud Run, a response with a fixed Content-Length is
    // treated as non-streaming: the platform caps it at ~32 MiB and the
    // container buffers the whole body in memory. That's why the ~33MB video
    // 500'd ("Response size was too large" + "Memory limit of 256 MiB exceeded"
    // in the logs) even after we switched to createReadStream — the header
    // defeated the streaming. Omitting Content-Length sends the body with
    // Transfer-Encoding: chunked (HTTP server-side streaming), which has no
    // size cap on Cloud Run and flushes chunk-by-chunk, so memory stays bounded
    // regardless of file size. Trade-off: the browser can't show a download
    // progress %, which is fine for these gated deliverables.
    const nodeStream = fs.createReadStream(assetPath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadName}"`,
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
