import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL_UPDATED, TERMS_SECTIONS } from "@/lib/legal";
import { SITE_NAME } from "@/lib/site";

const DESCRIPTION = `The terms for using ${SITE_NAME}: the component registry and the license it ships under, and RareUI Pro, including pricing, billing and refunds.`;

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

export default function TermsOfServicePage() {
  return (
    <>
      <GooeyNavbar />

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
