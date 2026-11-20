"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { materials } from "@/lib/content";

/** Full-bleed macro strip with a subtle parallax drift. */
export function MaterialsBand() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <section ref={ref} aria-label="Materials" className="relative">
      <ul className="grid grid-cols-2 md:grid-cols-4">
        {materials.map((m) => (
          <li key={m.name} className="relative aspect-[3/4] overflow-hidden md:aspect-[3/5] lg:aspect-[3/4]">
            <motion.div style={{ y }} className="absolute -inset-y-[9%] inset-x-0">
              <Image src={m.src} alt={`${m.name} texture`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg/75 via-bg/10 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7">
              <p className="font-serif text-2xl font-light text-ink/90 md:text-3xl">{m.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink/70">{m.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
