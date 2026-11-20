/**
 * Base path for static hosting under a sub-folder (GitHub Pages:
 * https://user.github.io/repo-name/). Empty everywhere else.
 * next/link and metadata files add it automatically; raw asset URLs
 * (canvas frames, <img>, next/image with unoptimized) go through `asset()`.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const asset = (path: string) => `${basePath}${path}`;
