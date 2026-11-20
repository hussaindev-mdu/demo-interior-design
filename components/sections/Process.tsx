"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EASE_OUT } from "@/lib/motion";

export function Process({ page = false }: { page?: boolean }) {
  return (
    <section id="process" aria-labelledby="process-title" className={`section ${page ? "pt-36 md:pt-48" : ""}`}>
      <SectionHeader
        level={page ? 1 : 2}
        id="process-title"
        label="Process"
        title="Five steps, one point of contact."
        intro="A clear sequence from first meeting to handover, with a single project lead beside you throughout."
      />

      <ol className="relative grid gap-12 pl-10 md:grid-cols-5 md:gap-8 md:pl-0 md:pt-14">
        {/* Rule: vertical on mobile, horizontal on desktop */}
        <motion.span
          aria-hidden="true"
          className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gold/40 md:hidden"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.8, ease: EASE_OUT }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute left-0 top-[5px] hidden h-px w-full origin-left bg-gold/40 md:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.8, ease: EASE_OUT }}
        />

        {processSteps.map((step, i) => (
          <motion.li
            key={step.title}
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.0, delay: 0.25 + i * 0.12, ease: EASE_OUT }}
          >
            <span
              aria-hidden="true"
              className="absolute -left-10 top-[2px] h-[11px] w-[11px] rounded-full border border-gold bg-bg md:-top-14 md:left-0"
            />
            <p className="font-serif text-lg font-light text-gold">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 font-serif text-2xl font-light leading-tight text-ink/90">{step.title}</h3>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-ink/60">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
