import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import LegalPage from "@/components/legal/LegalPage";
import { fetchStarCount } from "@/lib/github";
import { LEGAL_UPDATED, PRIVACY_SECTIONS } from "@/lib/legal";
import { SITE_NAME } from "@/lib/site";

const DESCRIPTION = `How ${SITE_NAME} handles your data: no accounts, no ads, no tracking cookies. What we collect, who processes it, how long we keep it, and how to reach us about it.`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/privacy",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
};

export default async function PrivacyPolicyPage() {
  const stars = await fetchStarCount();

  return (
    <>
      <GooeyNavbar stars={stars} />

      <LegalPage
        title="Privacy Policy"
        updated={LEGAL_UPDATED}
        intro={DESCRIPTION}
        sections={PRIVACY_SECTIONS}
      />

      <Footer />
    </>
  );
}
