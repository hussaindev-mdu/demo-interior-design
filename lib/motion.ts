import { motionValue } from "framer-motion";

/** Slow, eased, never bouncy. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const DURATION = 1.0;

/**
 * Hero pin progress (0 → 1), shared so UI outside the hero (e.g. the WhatsApp
 * button) can react to it without prop drilling.
 */
export const heroProgress = motionValue(0);
