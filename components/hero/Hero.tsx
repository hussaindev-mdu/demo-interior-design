"use client";

import { useReducedMotion } from "framer-motion";
import { HeroScrub } from "./HeroScrub";
import { HeroStatic } from "./HeroStatic";

/** Scroll-scrubbed sequence by default; a still image for prefers-reduced-motion. */
export function Hero() {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? <HeroStatic /> : <HeroScrub />;
}
