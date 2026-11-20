import { Contact } from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata(
  "/contact",
  "Book a consultation",
  `Book an interior design consultation with ${siteConfig.name} in ${siteConfig.city}. Call, WhatsApp or send us a few details about your space.`,
);

export default function ContactPage() {
  return (
    <main id="main">
      <Contact page />
    </main>
  );
}
