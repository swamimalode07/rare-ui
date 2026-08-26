import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import LegalPage from "@/components/legal/LegalPage";
import { fetchStarCount } from "@/lib/github";
import { LEGAL_UPDATED, TERMS_SECTIONS } from "@/lib/legal";
import { SITE_NAME } from "@/lib/site";

const DESCRIPTION = `The terms for using ${SITE_NAME}: the MIT licensed component registry, and the sponsorship that funds it, including pricing, billing, cancellation and refunds.`;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: DESCRIPTION,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `Terms of Service | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/terms",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
};

export default async function TermsOfServicePage() {
  const stars = await fetchStarCount();

  return (
    <>
      <GooeyNavbar stars={stars} />

      <LegalPage
        title="Terms of Service"
        updated={LEGAL_UPDATED}
        intro={DESCRIPTION}
        sections={TERMS_SECTIONS}
      />

      <Footer />
    </>
  );
}
