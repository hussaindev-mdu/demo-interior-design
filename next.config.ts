import type { NextConfig } from "next";

/**
 * Two build targets:
 *  - default (Vercel / any Node host): full app incl. the /api/contact route.
 *  - GITHUB_PAGES=true: static export to /out, served under NEXT_PUBLIC_BASE_PATH
 *    (e.g. "/repo-name"). No server, so the API route is left out and the
 *    contact form posts to NEXT_PUBLIC_CONTACT_ENDPOINT instead.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The API route is named route.api.ts. Only the server build includes the
  // "api.ts" extension, so the static export simply doesn't see it.
  pageExtensions: isPages ? ["tsx", "ts"] : ["api.ts", "tsx", "ts"],
  ...(isPages
    ? {
        output: "export" as const,
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        images: { formats: ["image/avif" as const, "image/webp" as const] },
        async headers() {
          // Frame URLs carry a ?v= version from lib/frames-manifest.json, so they
          // can be cached for a year; re-running prepare-frames changes it.
          const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
          return [
            { source: "/frames/:path*", headers: immutable },
            { source: "/frames-mobile/:path*", headers: immutable },
          ];
        },
      }),
};

export default nextConfig;
