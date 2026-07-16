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

    const size = fs.statSync(assetPath).size;
    const ext = path.extname(assetPath).toLowerCase();
    const contentType = CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream";

    // Downloaded filename: explicit downloadName, else the on-disk basename.
    // Sanitized to the safe pattern so it can't smuggle header characters.
    let downloadName = asset.downloadName || path.basename(assetPath);
    if (!/^[A-Za-z0-9._-]+$/.test(downloadName)) downloadName = path.basename(assetPath);

    // Stream the file rather than buffering it whole: a large asset (e.g. the
    // ~33MB video) would otherwise be read into memory and returned as one
    // buffered response, which fails on Cloud Run (256Mi container + a ~32MiB
    // buffered-response cap). Streaming sends it in chunks — bounded memory,
    // no size cap.
    const nodeStream = fs.createReadStream(assetPath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Content-Length": size.toString(),
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
