import type { MetadataRoute } from "next";

/**
 * Generates /robots.txt. Allows every crawler — including AI search AND
 * training bots (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
 * PerplexityBot, Google-Extended, etc.) — for maximum discoverability. Only
 * the internal API is disallowed.
 *
 * To allow AI *search* bots but block *training* crawlers instead, replace the
 * single "*" rule with per-bot rules (see the ai-discoverability workflow).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: "https://znas.io/sitemap.xml",
    host: "https://znas.io",
  };
}
