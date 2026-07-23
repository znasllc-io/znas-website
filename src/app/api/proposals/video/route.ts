import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { loadProposal, isAccessExpired } from "@/lib/proposals";
import { checkStreamRateLimit, getClientIp } from "@/lib/rate-limit";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";

/**
 * Gated, seekable streaming for a proposal's showcase video. GET (it's a
 * <video src>) with HTTP Range support (206 Partial Content) so the custom
 * player's scrub timeline can seek without downloading the whole file. Same
 * gate as the demo/download routes: the HttpOnly session cookie must be bound
 * to this slug and the access window must still be open. The file lives in
 * data/proposals/videos/ (outside /public) so it can't be reached without the
 * proposal's key.
 */

// Cap open-ended ranges (bytes=N-) so we never buffer the whole file in memory;
// browsers just request the next chunk as playback/seeking continues.
const MAX_CHUNK = 2 * 1024 * 1024; // 2 MB

const NOSNIFF = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } as const;

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const deny = () => new NextResponse("Not found", { status: 404, headers: NOSNIFF });

  if (!/^[a-z0-9-]+$/.test(slug)) return deny();

  const ip = getClientIp(request);
  const rateLimit = await checkStreamRateLimit({ ip, slug });
  if (!rateLimit.allowed) {
    return new NextResponse("Too many requests", { status: 429, headers: NOSNIFF });
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionSlug = await verifySession(token);
  if (!sessionSlug || sessionSlug !== slug) return deny();

  const proposal = loadProposal(slug);
  if (!proposal || isAccessExpired(proposal)) return deny();

  // Optional ?video=<id> selects one of proposal.videos[]; without it we serve
  // the single legacy videoFilename. Unknown/malformed ids deny (no leak).
  const videoId = request.nextUrl.searchParams.get("video");
  let videoFilename: string | undefined;
  if (videoId !== null) {
    if (!/^[a-z0-9-]+$/.test(videoId)) return deny();
    videoFilename = proposal.videos?.find((v) => v.id === videoId)?.filename;
  } else {
    videoFilename = proposal.videoFilename;
  }
  if (!videoFilename || !/^[a-z0-9-]+\.mp4$/.test(videoFilename)) return deny();

  const dir = path.resolve(path.join(process.cwd(), "data", "proposals", "videos"));
  const filePath = path.resolve(path.join(dir, videoFilename));
  if (!filePath.startsWith(dir + path.sep) || !fs.existsSync(filePath)) return deny();

  const total = fs.statSync(filePath).size;
  const baseHeaders = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Content-Type-Options": "nosniff",
  };

  // No return annotation: let it infer Buffer<ArrayBuffer> (a valid BodyInit).
  // Annotating `: Buffer` widens to Buffer<ArrayBufferLike>, which isn't.
  const readSlice = (start: number, end: number) => {
    const size = end - start + 1;
    const buf = Buffer.alloc(size);
    const fd = fs.openSync(filePath, "r");
    try {
      fs.readSync(fd, buf, 0, size, start);
    } finally {
      fs.closeSync(fd);
    }
    return buf;
  };

  const range = request.headers.get("range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === "" && m[2] === "")) {
      return new NextResponse(null, {
        status: 416,
        headers: { ...baseHeaders, "Content-Range": `bytes */${total}` },
      });
    }
    let start = m[1] ? parseInt(m[1], 10) : 0;
    let end = m[2] ? parseInt(m[2], 10) : total - 1;
    if (Number.isNaN(start) || start < 0) start = 0;
    if (Number.isNaN(end) || end > total - 1) end = total - 1;
    // Bound open-ended / oversized ranges.
    if (end - start + 1 > MAX_CHUNK) end = start + MAX_CHUNK - 1;
    if (start > end || start >= total) {
      return new NextResponse(null, {
        status: 416,
        headers: { ...baseHeaders, "Content-Range": `bytes */${total}` },
      });
    }
    const buf = readSlice(start, end);
    return new NextResponse(buf, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(buf.length),
      },
    });
  }

  // No Range header: serve a bounded first chunk as 206 so we never load the
  // whole file at once (the player will range-request the rest).
  const end = Math.min(total - 1, MAX_CHUNK - 1);
  const buf = readSlice(0, end);
  return new NextResponse(buf, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Range": `bytes 0-${end}/${total}`,
      "Content-Length": String(buf.length),
    },
  });
}
