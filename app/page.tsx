import type { Metadata } from "next";
import Link from "next/link";
import GooeyNavbar from "@/components/GooeyNavbar";
import { fetchStarCount } from "@/lib/github";
import HeroCta from "@/components/HeroCta";
import HeroIntro from "@/components/HeroIntro";
import ComponentsShowcase from "@/components/ComponentsShowcase";
import Footer from "@/components/Footer";
import { OpenSlotCard, SponsorCard } from "@/components/sponsors/SponsorCards";
import { SPONSORS, TIERS, TIER_CARD_HEIGHT } from "@/lib/sponsors";

const LOWEST_TIER_PRICE = Math.min(...TIERS.map((tier) => tier.price));

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const stars = await fetchStarCount();

  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(100svh_-_0.75rem,60rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212] md:min-h-[min(100svh_-_1.25rem,60rem)]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <GooeyNavbar stars={stars} />

          <img
            src="/logos/Rareui.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[68%] w-[860px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05] [filter:brightness(0)] dark:opacity-[0.07] dark:[filter:brightness(0)_invert(1)]"
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(255,255,255,0.07),transparent_60%)] dark:block" />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-20 pt-28 text-center sm:gap-4 sm:px-6">
            <HeroIntro
              headline="Tasteful Components, Made to Stand Out."
              sub="Rare UI is a free, open-source collection of rare animated React components. Browse them in action below and install any component with the shadcn CLI."
            >
              <HeroCta />
            </HeroIntro>
          </div>
        </div>
      </section>
      <ComponentsShowcase />
      <BackersSection />
      <Footer />
    </>
  );
}

function BackersSection() {
  return (
    <section
      id="sponsors"
      className="mx-auto flex w-full max-w-7xl scroll-mt-24 flex-col items-center gap-12 px-6 py-24 text-center md:py-32"
    >
      <h2 className="max-w-2xl text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl">
        Rare UI is backed and supported by the finest
      </h2>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {SPONSORS.map((sponsor) => (
          <SponsorCard
            key={sponsor.name}
            sponsor={sponsor}
            height={TIER_CARD_HEIGHT.gold}
          />
        ))}
        <OpenSlotCard height={TIER_CARD_HEIGHT.gold} />
      </div>

      <Link
        href="/sponsors"
        className="font-runde text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
      >
        Sponsorship from ${LOWEST_TIER_PRICE}/month. See all tiers &rarr;
      </Link>
    </section>
  );
}
