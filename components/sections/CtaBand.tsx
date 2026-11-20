import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

/** Closing call to action for the standalone pages. */
export function CtaBand({
  title = "Let’s talk about your space.",
  body = "Book a consultation at your site or our studio. We reply within one working day.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section aria-label="Book a consultation" className="border-t border-ink/10">
      <Reveal className="mx-auto flex max-w-site flex-col gap-10 px-6 py-24 md:flex-row md:items-end md:justify-between md:px-12 md:py-32">
        <div>
          <p className="label mb-5">Next step</p>
          <h2 className="max-w-2xl font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] text-ink/90">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/60">{body}</p>
        </div>
        <ButtonLink href="/contact" className="shrink-0 self-start md:self-auto">
          Book a consultation
        </ButtonLink>
      </Reveal>
    </section>
  );
}
