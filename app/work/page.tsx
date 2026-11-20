import { SelectedWork } from "@/components/sections/SelectedWork";
import { CtaBand } from "@/components/sections/CtaBand";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata(
  "/work",
  "Selected work",
  `Residences designed and delivered by ${siteConfig.name} across ${siteConfig.city} — living rooms, kitchens, ceilings and custom joinery.`,
);

export default function WorkPage() {
  return (
    <main id="main">
      <SelectedWork page />
      <CtaBand title="Imagine your home here." />
    </main>
  );
}
