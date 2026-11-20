import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { routes } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    // Static hosting uses trailing slashes (/work/), so match them to avoid redirects.
    url: `${siteConfig.url}${path !== "/" && process.env.GITHUB_PAGES === "true" ? `${path}/` : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
