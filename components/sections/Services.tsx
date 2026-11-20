import { services } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function Services({ page = false }: { page?: boolean }) {
  return (
    <section id="services" aria-labelledby="services-title" className={`section ${page ? "pt-36 md:pt-48" : ""}`}>
      <SectionHeader
        level={page ? 1 : 2}
        id="services-title"
        label="Services"
        title="One studio, from the slab to the last cushion."
        intro="We design and build complete interiors — so the structure, the services and the finishes are thought through together, not handed between contractors."
      />
      <ol className="border-t border-ink/10">
        {services.map((s, i) => (
          <Reveal as="li" key={s.title} className="border-b border-ink/10">
            <div className="grid gap-4 py-10 md:grid-cols-12 md:gap-8 md:py-12">
              <span className="font-serif text-xl font-light text-gold md:col-span-1 md:pt-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-[1.08] text-ink/90 md:col-span-5">
                {s.title}
              </h3>
              <div className="md:col-span-6 md:pt-2">
                <p className="max-w-lg text-[15px] leading-relaxed text-ink/60">{s.body}</p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-ink/55">{s.detail}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
