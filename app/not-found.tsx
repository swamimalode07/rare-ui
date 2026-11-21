import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import NotFoundHero from "@/components/not-found/NotFoundHero";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist. Browse the components instead.",
};

export default function NotFound() {
  return (
    <>
      <GooeyNavbar />

      <NotFoundHero />

      <Footer />
    </>
  );
}
