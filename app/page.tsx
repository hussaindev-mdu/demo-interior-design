import { Hero } from "@/components/hero/Hero";
import { Services } from "@/components/sections/Services";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Process } from "@/components/sections/Process";
import { MaterialsBand } from "@/components/sections/MaterialsBand";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <Services />
      <SelectedWork />
      <Process />
      <MaterialsBand />
      <Testimonials />
      <Contact />
    </main>
  );
}
