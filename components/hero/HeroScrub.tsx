"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, useMotionValue } from "framer-motion";
import { FrameCanvas } from "./FrameCanvas";
import { HeroOverlays } from "./HeroOverlays";
import { frameSrc } from "@/lib/frames";
import { heroProgress } from "@/lib/motion";

/**
 * Pinned scroll-scrubbed hero: a 350vh section with a sticky full-viewport
 * stage. Scroll progress through the section maps directly to frame index.
 */
export function HeroScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => heroProgress.set(v));

  const [ready, setReady] = useState(false);
  const loaded = useMotionValue(0);
  const [loadDone, setLoadDone] = useState(false);
  // Function form keeps this on the JS path (the accelerated scroll path
  // mis-mapped this simple two-keyframe opacity).
  const cueOpacity = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v / 0.04));

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="A room assembled layer by layer"
      className="relative h-[350vh]"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-bg">
        {/* Poster: frame 1 as a plain image so something paints before JS runs. */}
        <picture>
          <source media="(max-width: 768px)" srcSet={frameSrc(0, true)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameSrc(0, false)}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="frame-fit"
          />
        </picture>

        <div
          className={`absolute inset-0 transition-opacity duration-800 ease-lux ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <FrameCanvas
            progress={scrollYProgress}
            onReady={() => setReady(true)}
            onLoadProgress={(p) => {
              loaded.set(p);
              if (p >= 1) setLoadDone(true);
            }}
          />
        </div>

        <HeroOverlays progress={scrollYProgress} />

        {/* Scroll cue, on a dark fade so it reads over the bright floor */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg/90 via-bg/50 to-transparent portrait:hidden"
          aria-hidden="true"
        />
        <motion.div
          style={{ opacity: cueOpacity }}
          className="hero-legible pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 portrait:hidden"
          aria-hidden="true"
        >
          <p className="text-[12px] font-semibold uppercase tracking-label text-ink/95">Scroll to assemble</p>
          <span className="scroll-cue block h-10 w-px bg-gold" />
        </motion.div>

        {/* Hairline loading indicator for the frame sequence */}
        <motion.div
          aria-hidden="true"
          className={`absolute bottom-0 left-0 h-px w-full origin-left bg-gold/60 transition-opacity duration-1000 ${
            loadDone ? "opacity-0" : "opacity-100"
          }`}
          style={{ scaleX: loaded }}
        />
      </div>
    </section>
  );
}
