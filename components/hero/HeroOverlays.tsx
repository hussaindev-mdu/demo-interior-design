"use client";

import { interpolate, motion, useTransform, type MotionValue } from "framer-motion";
import { siteConfig } from "@/lib/site-config";
import { EASE_OUT } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

type Align = "center" | "left" | "right";

/**
 * Keyframed scroll transform, kept on the JS path on purpose: framer-motion's
 * hardware-accelerated (ScrollTimeline) path mis-mapped these opacities when
 * the target is a tall pinned section.
 */
function useRange(progress: MotionValue<number>, input: number[], output: number[]) {
  const map = interpolate(input, output);
  return useTransform(progress, (v) => map(v));
}

/** Fade window (fraction of the pin) at each end of a panel's range. */
const FADE = 0.055;

function usePanelMotion(progress: MotionValue<number>, start: number, end: number, first: boolean, last: boolean) {
  const inA = start + 0.01;
  const inB = start + 0.01 + FADE;
  const outA = end - 0.01 - FADE;
  const outB = end - 0.01;

  const opacity = useRange(
    progress,
    first ? [0, outA, outB] : last ? [inA, inB, 1] : [inA, inB, outA, outB],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useRange(
    progress,
    first ? [0, outA, outB] : last ? [inA, inB, 1] : [inA, inB, outA, outB],
    first ? [0, 0, -28] : last ? [28, 0, 0] : [28, 0, 0, -28],
  );
  // Hidden panels must not be clickable or reachable by keyboard.
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  return { opacity, y, visibility };
}

function Panel({
  progress,
  range: [start, end],
  align,
  first = false,
  last = false,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  align: Align;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  const { opacity, y, visibility } = usePanelMotion(progress, start, end, first, last);

  const position =
    align === "center"
      ? "landscape:inset-x-0 landscape:top-1/2 landscape:-translate-y-1/2 landscape:text-center landscape:items-center"
      : align === "left"
        ? "landscape:left-[7vw] landscape:top-1/2 landscape:-translate-y-1/2 landscape:max-w-[30rem]"
        : "landscape:right-[7vw] landscape:top-1/2 landscape:-translate-y-1/2 landscape:max-w-[30rem]";

  return (
    <div
      className={`absolute flex flex-col ${position} portrait:inset-x-6 portrait:top-[calc(36svh+39.4vw+1rem)] ${
        align === "center" ? "portrait:items-center portrait:text-center" : ""
      }`}
    >
      <motion.div style={{ opacity, y, visibility }} className="flex flex-col [align-items:inherit]">
        {children}
      </motion.div>
    </div>
  );
}

/** Soft scrims keep text legible over bright parts of the render. */
const SCRIM_BG = {
  left: "linear-gradient(90deg, rgb(var(--bg-rgb) / 0.82) 0%, rgb(var(--bg-rgb) / 0.45) 32%, transparent 58%)",
  right: "linear-gradient(270deg, rgb(var(--bg-rgb) / 0.82) 0%, rgb(var(--bg-rgb) / 0.45) 32%, transparent 58%)",
  center:
    "radial-gradient(ellipse 62% 48% at 50% 50%, rgb(var(--bg-rgb) / 0.78) 0%, rgb(var(--bg-rgb) / 0.5) 55%, rgb(var(--bg-rgb) / 0.15) 85%, transparent 100%)",
};

function Scrim({ progress, side, input, output }: { progress: MotionValue<number>; side: keyof typeof SCRIM_BG; input: number[]; output: number[] }) {
  const opacity = useRange(progress, input, output);
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 portrait:hidden"
      style={{ opacity, background: SCRIM_BG[side] }}
    />
  );
}

export function HeroOverlays({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="hero-legible absolute inset-0">
      <Scrim progress={progress} side="center" input={[0, 0.13, 0.19]} output={[1, 1, 0]} />
      <Scrim progress={progress} side="left" input={[0.21, 0.265, 0.385, 0.44, 0.76, 0.815, 1]} output={[0, 1, 1, 0, 0, 1, 1]} />
      <Scrim progress={progress} side="right" input={[0.46, 0.515, 0.685, 0.74]} output={[0, 1, 1, 0]} />

      <div className="relative h-full">
        {/* 0–20% · exploded view */}
        <Panel progress={progress} range={[0, 0.2]} align="center" first>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: EASE_OUT }}
            className="flex flex-col [align-items:inherit]"
          >
            <p className="label mb-6 text-[12px] font-semibold">Interior design · {siteConfig.city}</p>
            <h1 className="font-serif text-[clamp(3rem,9vw,8rem)] font-normal leading-[0.92] tracking-[-0.015em] text-ink">
              {siteConfig.name}
            </h1>
            <p className="mt-5 font-serif text-[clamp(1.25rem,2.4vw,2.1rem)] font-normal italic text-ink/95">
              Every layer, considered.
            </p>
          </motion.div>
        </Panel>

        {/* 20–45% · floor and structure closing */}
        <Panel progress={progress} range={[0.2, 0.45]} align="left">
          <p className="label mb-5">01 — Structure</p>
          <h2 className="font-serif text-[clamp(2rem,4.2vw,3.75rem)] font-normal leading-[1.02] text-ink">
            It begins beneath the surface.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink/80">
            A true structural base, acoustic and thermal insulation, then book-matched stone laid
            to a level you can feel underfoot.
          </p>
        </Panel>

        {/* 45–75% · walls and ceiling locking in */}
        <Panel progress={progress} range={[0.45, 0.75]} align="right">
          <p className="label mb-5">02 — Materials</p>
          <h2 className="font-serif text-[clamp(2rem,4.2vw,3.75rem)] font-normal leading-[1.02] text-ink">
            Marble, walnut, light.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink/80">
            Veined marble and walnut slats, a layered ceiling washed in warm cove light, and
            joinery made to measure for the room.
          </p>
        </Panel>

        {/* 75–100% · finished room */}
        <Panel progress={progress} range={[0.75, 1]} align="left" last>
          <p className="label mb-5">03 — Turnkey</p>
          <h2 className="font-serif text-[clamp(2rem,4.2vw,3.75rem)] font-normal leading-[1.02] text-ink">
            Designed end to end. Delivered turnkey.
          </h2>
          <div className="mt-8">
            <ButtonLink href="#contact">Book a consultation</ButtonLink>
          </div>
        </Panel>
      </div>
    </div>
  );
}
