import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import SponsorCta from "@/components/sponsors/SponsorCta";
import SponsorStats from "@/components/sponsors/SponsorStats";
import TierPricing from "@/components/sponsors/TierPricing";
import { TierGroup } from "@/components/sponsors/SponsorCards";
import { fetchStarCount } from "@/lib/github";
import { SITE_KEYWORDS } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { SPONSOR_EMAIL, SPONSOR_X_URL } from "@/lib/sponsors";

const TITLE = `Sponsors | ${SITE_NAME}`;

const DESCRIPTION =
  "Sponsor Rare UI (RareUI) and keep a free, open-source registry of rare animated React components available to every developer. Diamond, Gold and Silver tiers.";

const OG_IMAGE = {
  url: "/ogimage.webp",
  width: 2400,
  height: 1260,
  alt: "Rare UI — rare animated React components",
  type: "image/webp",
};

export const metadata: Metadata = {
  title: "Sponsors",
  description: DESCRIPTION,
  keywords: [
    "rare ui sponsors",
    "sponsor rare ui",
    "open source sponsorship",
    "ui library sponsor",
    ...SITE_KEYWORDS,
  ],
  alternates: {
    canonical: "/sponsors",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/sponsors",
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

export default async function SponsorsPage() {
  const stars = await fetchStarCount();

  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(78svh,50rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212]"
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
              headline="Sponsors"
              sub="Your support keeps Rare UI free and open-source for developers everywhere."
            >
              <div className="mt-4">
                <SponsorCta href="#tiers">Become a Sponsor</SponsorCta>
              </div>
            </HeroIntro>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-5 py-20 sm:px-6 md:py-28">
          <TierGroup
            tier="diamond"
            name="Diamond"
            emptyLabel="Be the first Diamond sponsor"
          />
          <TierGroup tier="gold" name="Gold" />
          <TierGroup
            tier="silver"
            name="Silver"
            emptyLabel="Be the first Silver sponsor"
          />
        </section>

        <TierPricing />
        <SponsorStats stars={stars} />

        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 pb-24 text-center sm:px-6 md:pb-32">
          <h2 className="text-balance font-runde text-2xl font-bold tracking-tight sm:text-3xl">
            Questions, or need a custom package?
          </h2>
          <p className="max-w-lg text-balance font-medium text-muted-foreground">
            Happy to put something together that fits how your team wants to
            show up.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <SponsorCta
              href={`mailto:${SPONSOR_EMAIL}`}
              variant="subtle"
              className="min-w-44"
            >
              Email me
            </SponsorCta>
            <SponsorCta
              href={SPONSOR_X_URL}
              variant="subtle"
              className="min-w-44"
            >
              DM on X
            </SponsorCta>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
