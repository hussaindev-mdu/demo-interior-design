#!/usr/bin/env node
/**
 * make-placeholders
 * ---------------------------------------------------------------------------
 * Generates PLACEHOLDER imagery so the site renders before real photography
 * exists. Replace the files in /public/projects and /public/materials with
 * real photographs (same file names, or update lib/content.ts).
 *
 *  - /public/projects/*.webp   crops of the hero render sequence
 *  - /public/materials/*.webp  procedural macro textures (marble, walnut, brass, fabric)
 *  - /app/opengraph-image.jpg  1200×630 social card from the finished-room frame
 *
 * Run after `npm run prepare-frames` (it reads /public/frames).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRAMES = path.join(ROOT, "public", "frames");
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, "lib", "frames-manifest.json"), "utf8"));
const frame = (n) => path.join(FRAMES, `frame_${String(n).padStart(4, "0")}.webp`);
const last = manifest.count;
const k = manifest.width / 1280; // crop boxes below are authored against a 1280px frame
const box = (l, t, w, h) => ({ left: Math.round(l * k), top: Math.round(t * k), width: Math.round(w * k), height: Math.round(h * k) });

// --- Projects: crops from the render ---------------------------------------
const projects = [
  { out: "project-01.webp", src: last, crop: box(70, 40, 1150, 640), w: 1600 },
  { out: "project-02.webp", src: last, crop: box(500, 150, 420, 520), w: 900 },
  { out: "project-03.webp", src: last, crop: box(110, 130, 420, 470), w: 900 },
  { out: "project-04.webp", src: Math.round(last * 0.5), crop: box(230, 20, 840, 630), w: 1400 },
  { out: "project-05.webp", src: last, crop: box(560, 100, 580, 330), w: 1200 },
];
await fs.mkdir(path.join(ROOT, "public", "projects"), { recursive: true });
for (const p of projects) {
  await sharp(frame(p.src))
    .extract(p.crop)
    .resize({ width: p.w, kernel: "lanczos3" })
    .modulate({ saturation: 0.92 })
    .webp({ quality: 80 })
    .toFile(path.join(ROOT, "public", "projects", p.out));
}

// --- Materials: procedural macro textures ------------------------------------
const W = 1000, H = 1300;
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);

const materials = {
  "marble.webp": svg(`
    <filter id="v" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.0022 0.0055" numOctaves="6" seed="23"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0 0.55 0.08 0 0 0 0 0 0 0 0.12 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/></feComponentTransfer>
      <feGaussianBlur stdDeviation="0.7"/>
    </filter>
    <filter id="c" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="4" seed="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.57  0 0 0 0 0.5  0 0 1 0 -0.4"/>
    </filter>
    <rect width="100%" height="100%" fill="#ECE7DF"/>
    <rect width="100%" height="100%" filter="url(#c)" opacity="0.5"/>
    <g transform="rotate(-28 500 650)"><rect x="-500" y="-500" width="2000" height="2300" fill="#7D6F5E" opacity="0.7" filter="url(#v)"/></g>`),

  "walnut.webp": svg(`
    <filter id="g" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09 0.0028" numOctaves="5" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0 0.02  1.6 0 0 0 -0.55"/>
    </filter>
    <filter id="f" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.004 0.03" numOctaves="3" seed="2"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.13  0 0 0 0 0.06  0 0.9 0 0 -0.2"/>
    </filter>
    <linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#5A3820"/><stop offset=".5" stop-color="#6B4428"/><stop offset="1" stop-color="#4E301B"/></linearGradient>
    <rect width="100%" height="100%" fill="url(#b)"/>
    <rect width="100%" height="100%" filter="url(#f)" opacity="0.6"/>
    <rect width="100%" height="100%" filter="url(#g)"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${(i + 1) * 100 - 2}" width="5" height="100%" fill="#1C110A" opacity="0.55"/>`).join("")}`),

  "brass.webp": svg(`
    <filter id="n" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.004" numOctaves="2" seed="5"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.92  0 0 0 0 0.7  0.6 0 0 0 -0.2"/>
    </filter>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6E5228"/><stop offset=".35" stop-color="#C8A165"/>
      <stop offset=".5" stop-color="#E6C98F"/><stop offset=".68" stop-color="#A9823F"/><stop offset="1" stop-color="#4A361A"/>
    </linearGradient>
    <rect width="100%" height="100%" fill="url(#b)"/>
    <rect width="100%" height="100%" filter="url(#n)" opacity="0.35"/>`),

  "fabric.webp": svg(`
    <pattern id="w" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="#9C8B78"/>
      <rect width="4" height="4" fill="#B3A390"/><rect x="4" y="4" width="4" height="4" fill="#B3A390"/>
      <rect width="8" height="1" fill="#8A7967" opacity=".6"/><rect width="1" height="8" fill="#C2B4A2" opacity=".4"/>
    </pattern>
    <filter id="t" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="9"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 1.1 -0.45"/>
    </filter>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
    <rect width="100%" height="100%" fill="url(#w)"/>
    <rect width="100%" height="100%" filter="url(#t)"/>
    <rect width="100%" height="100%" fill="url(#l)"/>`),
};
await fs.mkdir(path.join(ROOT, "public", "materials"), { recursive: true });
for (const [name, buf] of Object.entries(materials)) {
  await sharp(buf).webp({ quality: 82 }).toFile(path.join(ROOT, "public", "materials", name));
}

// --- Open Graph image ---------------------------------------------------------
await sharp(frame(last))
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(ROOT, "app", "opengraph-image.jpg"));

console.log("✓ Placeholder images written to public/projects, public/materials and app/opengraph-image.jpg");
