#!/usr/bin/env node
/**
 * prepare-frames
 * ---------------------------------------------------------------------------
 * Normalises the hero image sequence.
 *
 *  1. Reads every JPG / PNG / WebP in /public/frames (any file name) and sorts
 *     them in natural numeric order (frame 2 before frame 10).
 *  2. Converts each to WebP (quality 80), max 1920px wide, and renames them to
 *     /public/frames/frame_0001.webp, frame_0002.webp ...
 *  3. Writes a 960px-wide copy of each to /public/frames-mobile with the same name.
 *  4. Samples the background colour from the first frame.
 *  5. Writes /lib/frames-manifest.json  { count, width, height, mobileWidth,
 *     mobileHeight, background } — the hero and the page background read it.
 *
 * Originals are deleted only after *every* frame converted successfully. All
 * output is written to a temp folder first, so a failure halfway never leaves
 * the sequence in a mixed state, and the script is safe to re-run.
 *
 * Flags:
 *   --upscale   Enlarge sources narrower than 1920px (off by default: upscaling
 *               adds bytes without adding detail).
 *   --keep      Keep the original files.
 *   --force     Rebuild even if the folder already holds a prepared sequence.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRAMES_DIR = path.join(ROOT, "public", "frames");
const MOBILE_DIR = path.join(ROOT, "public", "frames-mobile");
const MANIFEST = path.join(ROOT, "lib", "frames-manifest.json");

const DESKTOP_WIDTH = 1920;
const MOBILE_WIDTH = 960;
const QUALITY = 80;
const CONCURRENCY = 6;

const args = new Set(process.argv.slice(2));
const UPSCALE = args.has("--upscale");
const KEEP = args.has("--keep");

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const pad = (n) => String(n).padStart(4, "0");

async function pool(items, limit, worker) {
  let i = 0;
  const run = async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

/**
 * Background colour = median colour of the frame's border (top strip plus the
 * upper two-thirds of the left/right edges). The bottom edge is excluded
 * because sequences often have a reflective floor there.
 */
async function sampleBackground(file) {
  const { data, info } = await sharp(file)
    .resize(320, null, { kernel: "nearest" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const band = Math.max(2, Math.round(w * 0.02));
  const r = [], g = [], b = [];
  const push = (x, y) => {
    const o = (y * w + x) * c;
    r.push(data[o]); g.push(data[o + 1]); b.push(data[o + 2]);
  };
  for (let y = 0; y < band; y++) for (let x = 0; x < w; x++) push(x, y);
  for (let y = band; y < Math.round(h * 0.66); y++) {
    for (let x = 0; x < band; x++) { push(x, y); push(w - 1 - x, y); }
  }
  const median = (a) => a.sort((m, n) => m - n)[Math.floor(a.length / 2)];
  const hex = (v) => v.toString(16).padStart(2, "0");
  return `#${hex(median(r))}${hex(median(g))}${hex(median(b))}`.toUpperCase();
}

async function main() {
  await fs.mkdir(FRAMES_DIR, { recursive: true });
  const sources = (await fs.readdir(FRAMES_DIR))
    .filter((f) => IMAGE_RE.test(f) && !f.startsWith("."))
    .sort(collator.compare)
    .map((f) => path.join(FRAMES_DIR, f));

  if (sources.length === 0) {
    console.error(`No images found in ${path.relative(ROOT, FRAMES_DIR)}/ — add your frames and re-run.`);
    process.exit(1);
  }

  // Already prepared? Skip, so re-running doesn't re-compress WebP → WebP.
  const normalised = sources.every((s, i) => path.basename(s) === `frame_${pad(i + 1)}.webp`);
  if (normalised && !args.has("--force")) {
    const mobile = await fs.readdir(MOBILE_DIR).catch(() => []);
    const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8").catch(() => "{}"));
    if (mobile.filter((f) => /^frame_\d+\.webp$/.test(f)).length === sources.length && manifest.count === sources.length) {
      console.log(`✓ ${sources.length} frames already prepared (background ${manifest.background}). Use --force to rebuild.`);
      return;
    }
  }

  console.log(`Found ${sources.length} frames. Converting…`);

  const stamp = Date.now();
  const tmpDesktop = path.join(ROOT, "public", `.frames-tmp-${stamp}`);
  const tmpMobile = path.join(ROOT, "public", `.frames-mobile-tmp-${stamp}`);
  await fs.mkdir(tmpDesktop, { recursive: true });
  await fs.mkdir(tmpMobile, { recursive: true });

  const background = await sampleBackground(sources[0]);
  let width = 0, height = 0, mobileWidth = 0, mobileHeight = 0;
  let bytesDesktop = 0, bytesMobile = 0, done = 0;

  try {
    await pool(sources, CONCURRENCY, async (src, i) => {
      const name = `frame_${pad(i + 1)}.webp`;
      const input = await fs.readFile(src); // read into memory so the source can be replaced later

      const d = await sharp(input)
        .resize({ width: DESKTOP_WIDTH, withoutEnlargement: !UPSCALE })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(path.join(tmpDesktop, name));
      const m = await sharp(input)
        .resize({ width: MOBILE_WIDTH, withoutEnlargement: !UPSCALE })
        .webp({ quality: QUALITY - 2, effort: 5 })
        .toFile(path.join(tmpMobile, name));

      if (i === 0) {
        ({ width, height } = d);
        mobileWidth = m.width;
        mobileHeight = m.height;
      }
      bytesDesktop += d.size;
      bytesMobile += m.size;
      done++;
      if (done % 20 === 0 || done === sources.length) {
        process.stdout.write(`  ${done}/${sources.length}\r`);
      }
    });
  } catch (err) {
    await fs.rm(tmpDesktop, { recursive: true, force: true });
    await fs.rm(tmpMobile, { recursive: true, force: true });
    console.error("\nConversion failed — originals left untouched.\n", err);
    process.exit(1);
  }

  // Every frame converted: now it's safe to swap.
  if (!KEEP) {
    await Promise.all(sources.map((s) => fs.rm(s, { force: true })));
  }
  // Remove stale output from an earlier run that had more frames.
  for (const dir of [FRAMES_DIR, MOBILE_DIR]) {
    await fs.mkdir(dir, { recursive: true });
    for (const f of await fs.readdir(dir)) {
      if (/^frame_\d+\.webp$/.test(f)) await fs.rm(path.join(dir, f), { force: true });
    }
  }
  for (const [tmp, dest] of [[tmpDesktop, FRAMES_DIR], [tmpMobile, MOBILE_DIR]]) {
    for (const f of await fs.readdir(tmp)) await fs.rename(path.join(tmp, f), path.join(dest, f));
    await fs.rm(tmp, { recursive: true, force: true });
  }

  const manifest = {
    count: sources.length,
    width,
    height,
    mobileWidth,
    mobileHeight,
    background,
    generatedAt: new Date().toISOString(),
  };
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  const mb = (n) => (n / 1024 / 1024).toFixed(1) + " MB";
  console.log(`\n✓ ${sources.length} frames → public/frames (${width}×${height}, ${mb(bytesDesktop)})`);
  console.log(`✓ ${sources.length} frames → public/frames-mobile (${mobileWidth}×${mobileHeight}, ${mb(bytesMobile)})`);
  console.log(`✓ Background sampled from frame 1: ${background}`);
  console.log(`✓ Manifest written to ${path.relative(ROOT, MANIFEST)}`);
  if (!UPSCALE && width < DESKTOP_WIDTH) {
    console.log(`  note: sources are ${width}px wide; kept native size (run with --upscale to force ${DESKTOP_WIDTH}px).`);
  }
}

main();
