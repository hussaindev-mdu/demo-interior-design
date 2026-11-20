"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Framer Motion honours prefers-reduced-motion site-wide. */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
