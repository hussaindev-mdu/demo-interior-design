import { Reveal } from "./Reveal";

export function SectionHeader({
  label,
  title,
  intro,
  id,
  level = 2,
}: {
  label: string;
  title: string;
  intro?: string;
  id?: string;
  /** 1 on standalone pages, 2 when the section sits on the homepage. */
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <Reveal className="mb-16 grid gap-6 md:mb-24 md:grid-cols-12">
      <p className="label md:col-span-3 md:pt-3">{label}</p>
      <div className="md:col-span-9">
        <Heading id={id} className="max-w-3xl font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-light leading-[1.02] text-ink/90">
          {title}
        </Heading>
        {intro && <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink/60">{intro}</p>}
      </div>
    </Reveal>
  );
}
