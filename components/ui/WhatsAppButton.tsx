"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { heroProgress } from "@/lib/motion";
import { whatsappUrl } from "@/lib/site-config";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Floating WhatsApp button. Hidden during the first 20% of the hero pin so it
 * doesn't cover the opening frame, then fades in.
 */
export function WhatsAppButton() {
  const onHome = usePathname() === "/";
  const [pastIntro, setPastIntro] = useState(false);
  const visible = !onHome || pastIntro;

  useEffect(() => {
    if (!onHome) return;
    const update = (v: number) => setPastIntro(v > 0.2);
    update(heroProgress.get());
    return heroProgress.on("change", update);
  }, [onHome]);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] transition-[opacity,transform] duration-1000 ease-lux hover:scale-[1.06] focus-visible:scale-[1.06] focus-visible:outline-offset-4 md:bottom-8 md:right-8 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-4 hidden whitespace-nowrap border border-ink/10 bg-bg px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/80 opacity-0 transition-opacity duration-800 ease-lux group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
      >
        Chat with us
      </span>
    </a>
  );
}
