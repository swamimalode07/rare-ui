import type { Metadata } from "next";

import { ErrorShell } from "@/components/error-pages/ErrorShell";
import { PetalBloom } from "@/components/error-pages/PetalBloom";

export const metadata: Metadata = {
  title: "404",
  description: "Unauthorized.",
  robots: { index: false, follow: false },
};

export default function Unauthorized() {
  return (
    <ErrorShell>
      <PetalBloom code="404" />
    </ErrorShell>
  );
}
