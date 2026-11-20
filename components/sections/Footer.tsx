import Link from "next/link";
import { fullAddress, navLinks, siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto grid max-w-site gap-10 px-6 py-16 md:grid-cols-12 md:px-12 md:py-20">
        <div className="md:col-span-5">
          <Link href="/" className="font-serif text-4xl font-light text-ink/90 md:text-5xl">
            {siteConfig.name}
          </Link>
          <p className="mt-3 font-serif text-lg font-light italic text-ink/60">{siteConfig.tagline}</p>
        </div>
        <address className="not-italic text-[14px] leading-relaxed text-ink/60 md:col-span-4">
          {fullAddress}
          <br />
          <a href={siteConfig.phoneHref} className="link-underline mt-3 inline-block text-ink/80">
            {siteConfig.phone}
          </a>
          <br />
          <a href={`mailto:${siteConfig.email}`} className="link-underline text-ink/80">
            {siteConfig.email}
          </a>
        </address>
        <div className="flex flex-col gap-3 text-[14px] md:col-span-3 md:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3 md:items-end">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-ink/70">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-[11px] uppercase tracking-label text-gold"
          >
            Instagram
          </a>
        </div>
        <p className="border-t border-ink/10 pt-6 text-[12px] text-ink/55 md:col-span-12">
          © {year} {siteConfig.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
