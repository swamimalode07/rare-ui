import type { Metadata } from "next";
import GooeyNavbar from "@/components/GooeyNavbar";
import ProHero from "@/components/hero/ProHero";
import ComponentsShowcase from "@/components/ComponentsShowcase";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import Footer from "@/components/Footer";
import SpiderWebs from "@/components/SpiderWebs";
import DiwaliLights from "@/components/DiwaliLights";
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(100svh_-_0.75rem,64rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212] md:min-h-[min(100svh_-_1.25rem,64rem)]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <ProHero />
          <GooeyNavbar />
          <SpiderWebs />
          <DiwaliLights />
        </div>
      </section>
      <ComponentsShowcase />
      <TestimonialsSection />
      <Footer />
    </>
  );
}
