import type { Metadata } from "next";
import { siteConfig } from "./site-config";

/** Per-page metadata that keeps Open Graph / Twitter in step with the title. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const full = `${title} — ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_IN", siteName: siteConfig.name, url: path, title: full, description },
    twitter: { card: "summary_large_image", title: full, description },
  };
}

export const routes = ["/", "/work", "/services", "/process", "/contact"] as const;
