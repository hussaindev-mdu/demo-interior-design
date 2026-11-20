#!/usr/bin/env node
/**
 * npm run deploy — build a static export and publish it to the `gh-pages`
 * branch of this repo's `origin` remote (GitHub Pages, "Deploy from a branch").
 *
 * - Base path is derived from the origin repo name (https://user.github.io/<repo>/).
 *   Override with NEXT_PUBLIC_BASE_PATH (use "" for a custom domain / user site).
 * - Set NEXT_PUBLIC_CONTACT_ENDPOINT (e.g. Formspree) so the form can send.
 * - Stop `npm run dev` first: the build and the dev server share `.next`.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import ghpages from "gh-pages";

const sh = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

let origin;
try {
  origin = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
} catch {
  console.error("No git remote 'origin'. Run: git init && git remote add origin https://github.com/<user>/<repo>.git");
  process.exit(1);
}
const m = origin.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
if (!m) {
  console.error(`origin is not a GitHub repo: ${origin}`);
  process.exit(1);
}
const [, owner, repo] = m;
const userSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (userSite ? "" : `/${repo}`);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${owner.toLowerCase()}.github.io${basePath}`;

if (!process.env.NEXT_PUBLIC_CONTACT_ENDPOINT) {
  console.warn("⚠  NEXT_PUBLIC_CONTACT_ENDPOINT is not set — the contact form will not be able to send on GitHub Pages.\n");
}

console.log(`Building for ${siteUrl}/ (base path "${basePath}")…`);
sh("npx next build", { GITHUB_PAGES: "true", NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_SITE_URL: siteUrl });
fs.writeFileSync("out/.nojekyll", "");

console.log("Publishing out/ to the gh-pages branch…");
await ghpages.publish("out", { dotfiles: true, message: "Deploy site" });
console.log(`✓ Published. Enable it once: repo Settings → Pages → Source: "Deploy from a branch" → gh-pages / (root).\n  ${siteUrl}/`);
