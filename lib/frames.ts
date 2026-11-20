import manifest from "./frames-manifest.json";
import { asset } from "./base-path";

export const frames = manifest;

/** Cache-busting version so frame URLs can be cached immutably. */
const version = manifest.generatedAt.replace(/\D/g, "").slice(0, 14);

export function frameSrc(index: number, mobile: boolean) {
  const n = String(index + 1).padStart(4, "0");
  return asset(`/frames${mobile ? "-mobile" : ""}/frame_${n}.webp?v=${version}`);
}

/** "#101011" → "16 16 17" for Tailwind's rgb(var(--bg-rgb) / α) pattern. */
export function hexToRgbTriplet(hex: string) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");
}

/**
 * Portrait fit (phones): show the whole room larger than "contain", slightly
 * above centre, leaving space below for the overlay text. Shared by the canvas
 * and the CSS fallback images so they line up exactly.
 */
export const PORTRAIT_FIT = { widthRatio: 1.4, centerY: 0.36 } as const;
