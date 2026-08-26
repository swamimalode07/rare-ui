export type SponsorTierId = "diamond" | "gold" | "silver";

export type SponsorTier = {
  id: SponsorTierId;
  name: string;
  price: number;
  perks: string[];
  checkoutUrl: string;
  featured?: boolean;
};

export type Sponsor = {
  name: string;
  href: string;
  tier: SponsorTierId;
  lightSrc: string;
  darkSrc: string;
  logoHeight: string;
};

export const TIERS_HREF = "/sponsors#tiers";

export const SPONSOR_X_URL = "https://x.com/swamimalode";

export const MONTHLY_PAGEVIEWS = "120K+";

export const TIERS: SponsorTier[] = [
  {
    id: "diamond",
    name: "Diamond",
    price: 250,
    featured: true,
    checkoutUrl:
      "https://www.creem.io/payment/prod_2VfSTJv2zZJwX8zmyiGK8r",
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
    price: 100,
    checkoutUrl:
      "https://www.creem.io/payment/prod_6zlt70u5xv7Cx40rsElck",
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
    price: 50,
    checkoutUrl:
      "https://www.creem.io/payment/prod_6lFZbxKu7OQmLT5iWAfcBP",
    perks: ["Logo in the README", "Listed on the sponsors page"],
  },
];

export const SPONSORS: Sponsor[] = [
  {
    name: "Databuddy",
    href: "https://www.databuddy.cc",
    tier: "gold",
    lightSrc: "/logos/databuddydark.svg",
    darkSrc: "/logos/databuddywhite.svg",
    logoHeight: "h-10 sm:h-12",
  },
  {
    name: "Mintlify",
    href: "https://mintlify.com",
    tier: "gold",
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
