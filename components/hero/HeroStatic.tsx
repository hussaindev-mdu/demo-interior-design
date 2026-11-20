"use client";

import Image from "next/image";
import { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { frames, frameSrc } from "@/lib/frames";
import { heroProgress } from "@/lib/motion";
import { siteConfig } from "@/lib/site-config";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";

const statements = [
  {
    label: "01 — Structure",
    title: "It begins beneath the surface.",
    body: "A true structural base, acoustic and thermal insulation, then book-matched stone laid to a level you can feel underfoot.",
  },
  {
    label: "02 — Materials",
    title: "Marble, walnut, light.",
    body: "Veined marble and walnut slats, a layered ceiling washed in warm cove light, and joinery made to measure for the room.",
  },
];

/**
 * prefers-reduced-motion version of the hero: the finished room as a still
 * image, with the narrative as simple fades instead of a scroll scrub.
 */
export function HeroStatic() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => heroProgress.set(v));

  return (
    <section ref={sectionRef} id="top" aria-label={`${siteConfig.name} — the finished room`}>
      <div className="relative h-svh overflow-hidden">
        <Image
          src={frameSrc(frames.count - 1, false)}
          alt="A finished living room with a marble feature wall, walnut slats and a cove-lit ceiling"
          width={frames.width}
          height={frames.height}
          priority
          unoptimized
          className="frame-fit"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 portrait:hidden"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 50%, rgb(var(--bg-rgb) / 0.78) 0%, rgb(var(--bg-rgb) / 0.5) 55%, rgb(var(--bg-rgb) / 0.15) 85%, transparent 100%)",
          }}
        />
        <div className="hero-legible absolute inset-x-6 flex flex-col items-center text-center landscape:top-1/2 landscape:-translate-y-1/2 portrait:top-[calc(36svh+39.4vw+1rem)]">
          <Reveal>
            <p className="label mb-6 text-[12px] font-semibold">Interior design · {siteConfig.city}</p>
            <h1 className="font-serif text-[clamp(3rem,9vw,8rem)] font-normal leading-[0.92] tracking-[-0.015em] text-ink">
              {siteConfig.name}
            </h1>
            <p className="mt-5 font-serif text-[clamp(1.25rem,2.4vw,2.1rem)] font-normal italic text-ink/95">
              Every layer, considered.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-site gap-16 px-6 py-24 md:grid-cols-3 md:px-12 md:py-32">
        {statements.map((s) => (
          <Reveal key={s.title}>
            <p className="label mb-5">{s.label}</p>
            <h2 className="font-serif text-4xl font-light leading-tight text-ink/90">{s.title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/60">{s.body}</p>
          </Reveal>
        ))}
        <Reveal>
          <p className="label mb-5">03 — Turnkey</p>
          <h2 className="font-serif text-4xl font-light leading-tight text-ink/90">
            Designed end to end. Delivered turnkey.
          </h2>
          <div className="mt-8">
            <ButtonLink href="#contact">Book a consultation</ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
