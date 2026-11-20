import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & { size?: "sm" | "md" };

/** Quiet brass-outline button. Fills with gold on hover/focus. */
export function ButtonLink({ size = "md", className = "", children, ...rest }: Props) {
  const sizing = size === "sm" ? "h-9 px-4 text-[10.5px]" : "h-12 px-7 text-[11px]";
  return (
    <Link
      {...rest}
      className={`group inline-flex items-center gap-3 border border-gold/70 uppercase tracking-label text-gold transition-colors duration-800 ease-lux hover:bg-gold hover:text-bg focus-visible:bg-gold focus-visible:text-bg ${sizing} ${className}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-800 ease-lux group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
