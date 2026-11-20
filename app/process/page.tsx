import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/process",
  "Process",
  "Consultation, concept and 3D visualization, materials selection, execution and handover — one project lead from first meeting to keys.",
);

export default function ProcessPage() {
  return (
    <main id="main">
      <Process page />
      <Testimonials />
      <CtaBand title="Start with a conversation." />
    </main>
  );
}
