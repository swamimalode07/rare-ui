import type { Metadata } from "next";
import { components } from "@/lib/components";
import {
  SITE_ALT_NAMES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const SITE_KEYWORDS = [
  "rareui",
  "rare ui",
  "rare ui components",
  "react components",
  "next.js components",
  "shadcn registry",
  "shadcn components",
  "animated ui components",
  "framer motion components",
  "motion react",
  "tailwind css components",
  "copy paste components",
  "ui component library",
  "microinteractions",
];

export function componentPageMetadata(href: string): Metadata {
  const item = components.find((c) => c.href === href);
  if (!item) return {};

  const name = item.name.toLowerCase();

  return {
    title: `${item.name} — Animated React Component`,
    description: item.description,
    keywords: [
      name,
      `${name} react`,
      `${name} component`,
      `animated ${name}`,
      `${name} shadcn`,
      ...SITE_KEYWORDS,
    ],
    alternates: {
      canonical: item.href,
    },
  };
}

export function componentJsonLd(href: string) {
  const item = components.find((c) => c.href === href);
  if (!item) return null;

  const url = `${SITE_URL}${item.href}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Components",
            item: `${SITE_URL}/components`,
          },
          { "@type": "ListItem", position: 3, name: item.name, item: url },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: item.name,
        description: item.description,
        url,
        programmingLanguage: "TypeScript",
        runtimePlatform: "React",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        logo: `${SITE_URL}/logos/Rareui.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        softwareHelp: `${SITE_URL}/components`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };
}

export function componentsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Components`,
    url: `${SITE_URL}/components`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: components.length,
      itemListElement: components.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        description: item.description,
        url: `${SITE_URL}${item.href}`,
      })),
    },
  };
}
