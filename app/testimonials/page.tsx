import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import TestimonialWall from "@/components/testimonials/TestimonialWall";
import { SITE_KEYWORDS } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const TITLE = `Testimonials | ${SITE_NAME}`;

const DESCRIPTION =
  "What designers and engineers say about Rare UI (RareUI), a registry of rare animated React components.";

const OG_IMAGE = {
  url: "/ogimage.webp",
  width: 2400,
  height: 1260,
  alt: "Rare UI — rare animated React components",
  type: "image/webp",
};

export const metadata: Metadata = {
  title: "Testimonials",
  description: DESCRIPTION,
  keywords: [
    "rare ui testimonials",
    "rare ui reviews",
    "ui library reviews",
    ...SITE_KEYWORDS,
  ],
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/testimonials",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [OG_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function TestimonialsPage() {
  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(78svh,50rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <GooeyNavbar />

          <img
            src="/logos/Rareui.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[68%] w-[860px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05] [filter:brightness(0)] dark:opacity-[0.07] dark:[filter:brightness(0)_invert(1)]"
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(255,255,255,0.07),transparent_60%)] dark:block" />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-20 pt-28 text-center sm:gap-4 sm:px-6">
            <HeroIntro
              headline="Testimonials"
              sub="What people building real products say about Rare UI."
            >
              <a
                href="#wall"
                className="flex flex-col items-center gap-2 font-runde text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
              >
                Scroll to read them all
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 animate-bounce motion-reduce:animate-none"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </a>
            </HeroIntro>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section
          id="wall"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-6 md:py-28"
        >
          <TestimonialWall />
        </section>
      </main>

      <Footer />
    </>
  );
}
