import { SITE_URL } from "@/lib/site";

export type SponsorTierId = "diamond" | "gold" | "silver";

export type SponsorTier = {
  id: SponsorTierId;
  name: string;
  price: number;
  perks: string[];
  checkoutUrl: string;
  featured?: boolean;
};

export type SponsorBrand = {
  name: string;
  href: string;
  lightSrc: string;
  darkSrc: string;
  logoHeight: string;
};

export type Sponsor = SponsorBrand & { tier: SponsorTierId };

export type PlatformSponsor = SponsorBrand & { role: string };

export const TIERS_HREF = "/sponsors#tiers";

export const SPONSOR_X_URL = "https://x.com/swamimalode";

export const MONTHLY_PAGEVIEWS = "165K+";

// dodo does not echo the product back on the return url, so the tier is carried on redirect_url
function checkoutUrl(productId: string, tier: SponsorTierId) {
  const redirect = `${SITE_URL}/sponsors/thank-you?tier=${tier}`;
  return `https://checkout.dodopayments.com/buy/${productId}?quantity=1&redirect_url=${encodeURIComponent(redirect)}`;
}

export const TIERS: SponsorTier[] = [
  {
    id: "diamond",
    name: "Diamond",
    price: 249,
    featured: true,
    checkoutUrl: checkoutUrl("pdt_0NmWwRrCkr52Q8lUgnRmv", "diamond"),
    perks: [
      "Largest logo on the sponsors page",
      "Largest logo on the home page",
      "Largest logo in the README",
      "Shoutout on X",
      "Direct line for feedback and requests",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 149,
    checkoutUrl: checkoutUrl("pdt_0NmX0YaB0scByQK477GpK", "gold"),
    perks: [
      "Larger logo on the sponsors page",
      "Logo on the home page",
      "Larger logo in the README",
      "Shoutout on X",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 49,
    checkoutUrl: checkoutUrl("pdt_0NmX0j1cBjnmqah0xjy0l", "silver"),
    perks: ["Logo in the README", "Listed on the sponsors page"],
  },
];

export const SPONSORS: Sponsor[] = [];

export const PLATFORM_TIER_NAME = "Platform Sponsors";

export const PLATFORM_TIER_BLURB =
  "Products that back Rare UI through their open-source programs.";

export const PLATFORM_CARD_HEIGHT = "h-24 sm:h-32";

export const PLATFORM_CARD_WIDTH = "sm:w-[calc((100%-2rem)/3)]";

export const PLATFORM_SPONSORS: PlatformSponsor[] = [
  {
    name: "Databuddy",
    role: "Analytics Sponsor",
    href: "https://www.databuddy.cc",
    lightSrc: "/logos/databuddydark.svg",
    darkSrc: "/logos/databuddywhite.svg",
    logoHeight: "h-10 sm:h-12",
  },
  {
    name: "Mintlify",
    role: "Docs Sponsor",
    href: "https://mintlify.com",
    lightSrc: "/logos/mintlifydark.png",
    darkSrc: "/logos/mintlifylight.png",
    logoHeight: "h-8 sm:h-9.5",
  },
];

export const TIER_CARD_HEIGHT: Record<SponsorTierId, string> = {
  diamond: "h-32 sm:h-44",
  gold: "h-24 sm:h-32",
  silver: "h-20 sm:h-24",
};

export const TIER_CARD_WIDTH: Record<SponsorTierId, string> = {
  diamond: "sm:w-[calc((100%-1rem)/2)]",
  gold: "sm:w-[calc((100%-2rem)/3)]",
  silver: "sm:w-[calc((100%-3rem)/4)]",
};

export function sponsorsByTier(tier: SponsorTierId) {
  return SPONSORS.filter((sponsor) => sponsor.tier === tier);
}

export function tierById(tier: SponsorTierId) {
  return TIERS.find((entry) => entry.id === tier)!;
}

export function tierByParam(value?: string | string[]) {
  if (typeof value !== "string") return undefined;
  return TIERS.find((tier) => tier.id === value);
}

export const SPONSOR_ASSET_CHECKLIST = [
  {
    title: "Your logo",
    detail:
      "SVG is best. If you only have a PNG, send it at 2x on a transparent background, at least 512px wide.",
  },
  {
    title: "A light and a dark version",
    detail:
      "The site runs in both themes. If you only have one version, send it anyway and we will make it work.",
  },
  {
    title: "The link destination",
    detail:
      "The exact URL your logo should point to, including any UTM tags you want on it.",
  },
  {
    title: "Your name as it should appear",
    detail:
      "Company or product name, spelled and capitalised the way you want it read.",
  },
  {
    title: "Your X and LinkedIn handles",
    detail: "For the shoutout post, on Diamond and Gold tiers.",
  },
];
