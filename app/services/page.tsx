import { Services } from "@/components/sections/Services";
import { MaterialsBand } from "@/components/sections/MaterialsBand";
import { CtaBand } from "@/components/sections/CtaBand";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata(
  "/services",
  "Services",
  `Residential interiors, modular kitchens, false ceilings and lighting, wardrobes and joinery, and turnkey execution in ${siteConfig.city}.`,
);

export default function ServicesPage() {
  return (
    <main id="main">
      <Services page />
      <MaterialsBand />
      <CtaBand />
    </main>
  );
}
