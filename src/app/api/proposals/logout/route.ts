import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_PATH } from "@/lib/session";

/**
 * Clear the proposal session cookie. POST-only so CSRF via a stray <img> or
 * link preview can't silently log the user out; SameSite=Strict on the
 * original cookie is the first line of defense, this is the second.
 */
export async function POST() {
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: SESSION_COOKIE_PATH,
    maxAge: 0,
  });
  return response;
}
