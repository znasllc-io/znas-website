import type { MetadataRoute } from "next";

const BASE = "https://znas.io";

/**
 * Public, indexable routes. Password-gated proposal pages
 * (/engagements/[slug]) are intentionally excluded — they shouldn't be indexed.
 */
const ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/portfolio", priority: 0.8 },
  { path: "/memql", priority: 0.7 },
  { path: "/copresent", priority: 0.7 },
  { path: "/case-studies/manufacturing", priority: 0.7 },
  { path: "/case-studies/automotive-retail", priority: 0.7 },
  { path: "/engagements", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
