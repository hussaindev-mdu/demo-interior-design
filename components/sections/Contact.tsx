import { fullAddress, siteConfig, whatsappUrl } from "@/lib/site-config";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";

export function Contact({ page = false }: { page?: boolean }) {
  const Heading = page ? "h1" : "h2";
  return (
    <section id="contact" aria-labelledby="contact-title" className={`section ${page ? "pt-36 md:pt-48" : ""}`}>
      <div className="grid gap-16 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-4">
          <p className="label mb-6">Contact</p>
          <Heading id="contact-title" className="font-serif text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.02] text-ink/90">
            Book a consultation.
          </Heading>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink/60">
            Tell us a little about your space. We reply within one working day to arrange a
            meeting at your site or our studio.
          </p>

          <dl className="mt-12 space-y-6 text-[15px]">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ink/55">Call</dt>
              <dd className="mt-1">
                <a href={siteConfig.phoneHref} className="link-underline text-ink/85">
                  {siteConfig.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ink/55">WhatsApp</dt>
              <dd className="mt-1">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-ink/85">
                  Message the studio
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ink/55">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${siteConfig.email}`} className="link-underline text-ink/85">
                  {siteConfig.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-ink/55">Studio</dt>
              <dd className="mt-1 max-w-xs text-ink/70">{fullAddress}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="md:col-span-7 md:col-start-6" delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
