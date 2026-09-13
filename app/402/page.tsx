import type { Metadata } from "next";

import { ErrorShell } from "@/components/error-pages/ErrorShell";
import { GlowBloom } from "@/components/error-pages/GlowBloom";

export const metadata: Metadata = {
  title: "404",
  description: "Payment required.",
  robots: { index: false, follow: false },
};

export default function PaymentRequired() {
  return (
    <ErrorShell>
      <GlowBloom code="404" />
    </ErrorShell>
  );
}
