"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, siteConfig } from "@/lib/site-config";
import { EASE_OUT } from "@/lib/motion";
import { ButtonLink } from "./ButtonLink";

export function Nav() {
  // Normalise "/work/" (trailingSlash on static hosting) to "/work".
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Mobile menu: lock scroll, close on Escape, manage focus.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => firstLinkRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-1000 ease-lux ${
          scrolled && !open ? "border-ink/10 bg-bg/85" : "hero-legible border-transparent bg-transparent"
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-site items-center justify-between px-6 md:h-[72px] md:px-12">
          <Link href="/" className="font-serif text-[22px] font-normal tracking-[0.01em] text-ink/90">
            {siteConfig.name}
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <ul className="flex items-center gap-9">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={pathname === l.href ? "page" : undefined}
                    className="link-underline text-[11px] uppercase tracking-label text-ink/70 transition-colors duration-800 hover:text-ink/95 aria-[current=page]:text-gold aria-[current=page]:[background-size:100%_1px]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/contact" size="sm">
              Book a consultation
            </ButtonLink>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`absolute h-px w-6 bg-ink/90 transition-transform duration-800 ease-lux ${
                open ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              className={`absolute h-px w-6 bg-ink/90 transition-transform duration-800 ease-lux ${
                open ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-bg px-6 pb-10 pt-28 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: EASE_OUT }}
                >
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={l.href}
                    aria-current={pathname === l.href ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-5 border-b border-ink/10 py-4 font-serif text-[2.75rem] font-light leading-none text-ink/90"
                  >
                    <span className="label text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-6">
              <ButtonLink href="/contact" onClick={() => setOpen(false)} className="justify-center">
                Book a consultation
              </ButtonLink>
              <div className="flex justify-between text-[13px] text-ink/60">
                <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
