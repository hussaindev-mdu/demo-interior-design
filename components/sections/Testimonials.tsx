"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { testimonials } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";

/*
 * ⚠️ PLACEHOLDER CONTENT: the quotes and names rendered here come from
 * `testimonials` in lib/content.ts and are NOT real client reviews.
 * Replace them with genuine, permissioned client reviews before launch.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);
  const t = testimonials[index];

  return (
    <section aria-labelledby="words-title" className="section">
      <div className="grid gap-10 md:grid-cols-12">
        <p id="words-title" className="label md:col-span-3 md:pt-4">
          Client words
        </p>

        <div
          className="md:col-span-9"
          role="group"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <div className="relative min-h-[18rem] md:min-h-[16rem]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
              >
                <span aria-hidden="true" className="block font-serif text-6xl leading-none text-gold/70">
                  “
                </span>
                <blockquote className="mt-2 max-w-3xl font-serif text-[clamp(1.5rem,2.8vw,2.4rem)] font-light leading-[1.25] text-ink/90">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-8 text-[11px] uppercase tracking-[0.22em] text-ink/60">
                  <span className="text-ink/85">{t.name}</span>
                  <span className="mx-3 text-gold">·</span>
                  {t.project}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex items-center gap-8 border-t border-ink/10 pt-6">
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="nav-arrow">
                ←
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="nav-arrow">
                →
              </button>
            </div>
            <p className="font-serif text-lg font-light text-ink/60" aria-hidden="true">
              <span className="text-gold">{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
