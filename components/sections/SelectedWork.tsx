import Image from "next/image";
import { projects } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

/** Asymmetric editorial grid. Layout per slot; content comes from lib/content.ts. */
const layout = [
  { col: "md:col-span-7", aspect: "aspect-[4/3]", offset: "", sizes: "(min-width: 768px) 58vw, 100vw" },
  { col: "md:col-span-4 md:col-start-9", aspect: "aspect-[4/5]", offset: "md:mt-40", sizes: "(min-width: 768px) 33vw, 100vw" },
  { col: "md:col-span-5", aspect: "aspect-[4/5]", offset: "md:-mt-16", sizes: "(min-width: 768px) 42vw, 100vw" },
  { col: "md:col-span-6 md:col-start-7", aspect: "aspect-[4/3]", offset: "md:mt-24", sizes: "(min-width: 768px) 50vw, 100vw" },
  { col: "md:col-span-8 md:col-start-3", aspect: "aspect-[16/9]", offset: "md:mt-8", sizes: "(min-width: 768px) 67vw, 100vw" },
];

export function SelectedWork({ page = false }: { page?: boolean }) {
  return (
    <section id="work" aria-labelledby="work-title" className={`section ${page ? "pt-36 md:pt-48" : ""}`}>
      <SectionHeader
        level={page ? 1 : 2}
        id="work-title"
        label="Selected work"
        title="Homes built in layers."
        intro="A selection of recent residences across the city — each designed, detailed and delivered by the studio."
      />
      <ul className="grid gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-12">
        {projects.map((p, i) => {
          const l = layout[i % layout.length];
          return (
            <Reveal as="li" key={p.name} className={`${l.col} ${l.offset}`}>
              <figure className="group">
                <div className={`relative overflow-hidden bg-ink/5 ${l.aspect}`}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes={l.sizes}
                    className="object-cover transition-transform duration-[2400ms] ease-lux group-hover:scale-[1.045]"
                  />
                </div>
                <figcaption className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-serif text-2xl font-light text-ink/90">{p.name}</span>
                  <span className="text-[11px] sm:shrink-0 sm:text-right uppercase tracking-[0.2em] text-ink/55">
                    {p.location}
                    <span className="mx-2 text-gold">·</span>
                    {p.area.toLocaleString("en-IN")} sq ft
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
