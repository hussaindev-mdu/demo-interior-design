# Atelier Strata — studio website

Marketing site for a luxury interior design studio. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion.

The hero is a pre-rendered image sequence (190 frames, exploded room → finished room) scrubbed by scroll on a `<canvas>`.

```bash
npm install
npm run prepare-frames   # once, or whenever frames change
npm run dev              # http://localhost:3000
npm run build && npm start
```

Requires Node 18.18+ (Node 20+ recommended — see *Upgrading* below).

---

## Before launch — replace the placeholders

| What | Where |
|---|---|
| Studio name, city, address, phone, WhatsApp number, email, Instagram | `lib/site-config.ts` (single source of truth — nav, footer, contact, WhatsApp button, metadata and JSON-LD all read from it) |
| Project names, locations, areas | `lib/content.ts` → `projects` |
| Project photos | `public/projects/project-0X.webp` (currently crops of the hero render) |
| Material photos | `public/materials/*.webp` (currently procedural textures) |
| **Testimonials** | `lib/content.ts` → `testimonials`. These are clearly marked **PLACEHOLDER** and must be replaced with real, permissioned client reviews. |
| Production URL | `NEXT_PUBLIC_SITE_URL` env var (canonical, sitemap, OG) |

`npm run placeholder-images` regenerates the placeholder project/material images and `app/opengraph-image.jpg` from the frames. Don't run it after you've added real photos — it overwrites those files.

---

## Frame preparation

Put the frames in `public/frames/`. Any mix of JPG, PNG or WebP with any file names works, as long as they sort correctly in natural order (`2` before `10`). Frame 1 must be the exploded view and the last frame the finished room. Then:

```bash
npm run prepare-frames
```

The script (`scripts/prepare-frames.mjs`, using sharp):

1. Sorts the images in natural numeric order.
2. Converts each to WebP (quality 80, max 1920px wide) as `public/frames/frame_0001.webp`, `frame_0002.webp` …
3. Writes a 960px copy of each to `public/frames-mobile/` with the same names.
4. **Samples the background colour from frame 1** (median of the frame border). That hex value becomes the page background, so the sequence has no visible edges.
5. Writes `lib/frames-manifest.json` (`count`, dimensions, `background`, version). The hero, the page background and the theme colour all read it, so nothing needs editing by hand.

Originals are deleted only after **every** frame converted successfully. Output goes to a temp folder first, so a failure leaves your originals untouched. Re-running on an already-prepared folder is a no-op.

Flags: `--upscale` (enlarge sources narrower than 1920px, off by default because it adds bytes without detail), `--keep` (keep originals), `--force` (rebuild a prepared folder).

> The supplied frames are 1280×720, so the desktop set stays at 1280px (≈18 MB total, ≈95 KB/frame). Mobile is ≈10.5 MB. For a crisper hero on large screens, export the sequence at 1920px or wider and re-run.

### How the hero works

- `components/hero/HeroScrub.tsx` — a 350vh section with a sticky full-viewport stage. Scroll progress (0→1) maps directly to the frame index.
- `components/hero/FrameCanvas.tsx` — DPR-aware canvas (capped at 2×). It draws with object-fit: cover on landscape screens, and with a larger-than-contain fit plus feathered edges on portrait phones. Between frames N and N+1 it blends by the fractional index, so motion is interpolated, never snapped. Drawing runs in requestAnimationFrame only while the hero is on screen.
- `components/hero/frame-store.ts` — frame 1 loads first; the rest load after the `load` event, coarse-to-fine, so early scrubbing already has an even spread of frames. Frames are kept as compressed blobs and decoded with `createImageBitmap` into a **bounded** cache: anchor frames plus a window around the scroll position, biased in the scroll direction. Decoding all 190 frames would cost ~700 MB of memory. If the exact frame isn't decoded yet, the nearest one is drawn, so the canvas never waits.
- `components/hero/HeroOverlays.tsx` — the four narrative panels and their scroll ranges.
- `prefers-reduced-motion` swaps in `HeroStatic.tsx`: a still of the finished room with simple fades.

---

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | yes (prod) | API key from [resend.com](https://resend.com/api-keys) |
| `CONTACT_TO_EMAIL` | yes (prod) | Inbox that receives consultation requests (comma-separate for several) |
| `CONTACT_FROM_EMAIL` | no | Verified sender, e.g. `Atelier Strata <hello@yourstudio.com>`. Defaults to `onboarding@resend.dev`, which only delivers to your own Resend account email, so verify your domain in Resend before launch. |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | e.g. `https://www.yourstudio.com` |

In development without Resend credentials, `/api/contact` logs submissions to the terminal and returns success. In production it returns an error asking the visitor to call or WhatsApp instead.

### Contact form

- `lib/contact-schema.ts` holds a single zod schema used by the form (react-hook-form) **and** the route handler (`app/api/contact/route.ts`).
- Phone must be an Indian mobile (`+91` / `91` / `0` prefix optional, 10 digits starting 6–9). It is normalised to `+91XXXXXXXXXX` in the email.
- Spam protection: a hidden honeypot field, a minimum fill time (2.5 s), and a rate limit of 5 requests per 10 minutes per IP. Bots that trip a trap get a fake success response.
- The rate limiter is in-memory, so on Vercel it applies per serverless instance. For a strict global limit, back `lib/rate-limit.ts` with Upstash Redis.

---

## Deploying to Vercel

1. Push the repo to GitHub/GitLab and import it at [vercel.com/new](https://vercel.com/new). The framework is auto-detected as Next.js.
2. Add the environment variables above under **Settings → Environment Variables** (Production and Preview).
3. Deploy. Run `prepare-frames` locally and **commit** `public/frames`, `public/frames-mobile` and `lib/frames-manifest.json`. Don't run it at build time, because sharp then deletes the source frames.
4. Add your domain under **Settings → Domains**, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
5. In Resend, verify the domain and set `CONTACT_FROM_EMAIL` to an address on it.

Frame URLs carry a `?v=` version from the manifest and are served with `Cache-Control: immutable`. Re-running `prepare-frames` changes the version, so browsers fetch the new frames.

---

## Deploying to GitHub Pages (static)

GitHub Pages only serves static files, so `npm run build:pages` makes a **static export** (`out/`). There is no server, so `/api/contact` isn't included, and the contact form posts to a form service instead.

1. Create a form at [Formspree](https://formspree.io) (or a similar service). Copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
2. In the GitHub repo, go to **Settings → Secrets and variables → Actions → Variables** and add `NEXT_PUBLIC_CONTACT_ENDPOINT` = that endpoint.
3. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Commit the frames and push to `main`. `.github/workflows/deploy-pages.yml` builds and deploys. The workflow sets the base path (`/<repo-name>`) and site URL automatically.

The site is served at `https://<user>.github.io/<repo-name>/`. For a custom domain, set it under **Settings → Pages**. The base path then becomes empty automatically.

Without `NEXT_PUBLIC_CONTACT_ENDPOINT`, the form on Pages can't send. Visitors see an error that points them to call or WhatsApp instead.

**Alternative: deploy from your machine (`gh-pages` branch).** Run `npm run deploy` (with `npm run dev` stopped). It builds the static export, derives the base path from your `origin` repo name, and pushes `out/` to the `gh-pages` branch. Then set **Settings → Pages → Source** to *Deploy from a branch* → `gh-pages` / root. Pick either this or the Actions workflow, not both.

**Local test:** `NEXT_PUBLIC_BASE_PATH=/<repo-name> npm run build:pages`, then serve `out/` under that sub-path. **Stop `npm run dev` first.** Both commands use the `.next` folder, and running them together corrupts it. If that happens: `rm -rf .next` and restart dev.

How it works:
- `next.config.ts` switches to `output: "export"`, `basePath` and `trailingSlash` when `GITHUB_PAGES=true`.
- The API route file is `route.api.ts`. Only the server build registers the `api.ts` page extension, so the export ignores it.
- Raw asset URLs (canvas frames, images) go through `asset()` in `lib/base-path.ts`, so they work under the sub-path.

---

## Pages

| Route | Content |
|---|---|
| `/` | Scroll-scrubbed hero plus every section (the full story) |
| `/work` | Selected work grid |
| `/services` | Services list and materials band |
| `/process` | Process timeline and client words |
| `/contact` | Consultation form and contact details |

The nav links to the standalone pages. The nav, footer, WhatsApp button and JSON-LD live in `app/layout.tsx`, so they appear on every page. Each section component takes a `page` prop, which makes its heading the page's `h1`.

---

## Structure

```
app/                 layout, home page, work/ services/ process/ contact/, api/contact, sitemap, robots, icons, OG image
components/hero/     scroll-scrubbed hero (canvas, frame store, overlays, static fallback)
components/sections/ Services, SelectedWork, Process, MaterialsBand, Testimonials, Contact(+Form), Footer
components/ui/       Nav, ButtonLink, Reveal, SectionHeader, WhatsAppButton, JsonLd, Providers
lib/                 site-config, content, contact-schema, rate-limit, frames(+manifest), motion
scripts/             prepare-frames, make-placeholders
```

## SEO

Metadata, Open Graph and Twitter cards are in `app/layout.tsx`. The OG image is `app/opengraph-image.jpg`, the favicon is `app/icon.svg`, and the Apple touch icon is `app/apple-icon.png`. `/sitemap.xml` and `/robots.txt` are generated. JSON-LD lives in `components/ui/JsonLd.tsx`. schema.org has no `InteriorDesigner` type, so it uses `LocalBusiness` + `HomeAndConstructionBusiness` with the trade described in `description`/`knowsAbout`. That passes Google's Rich Results Test, where an invented type would not.

## Upgrading

The dependency versions are pinned for **Node 18** compatibility. On Node 20+, upgrade `sharp` to 0.35+ to clear the libvips/libheif advisories `npm audit` reports for 0.33. sharp only runs locally on your own frames, so the practical risk is low. You can also move to Next 16.
