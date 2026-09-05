import type { Metadata } from "next";

import { BackHome } from "@/components/error-pages/BackHome";
import { DriftingLogo } from "@/components/error-pages/DriftingLogo";
import { ErrorShell, INK } from "@/components/error-pages/ErrorShell";

export const metadata: Metadata = {
  title: "404",
  description: "Bad request.",
  robots: { index: false, follow: false },
};

export default function BadRequest() {
  return (
    <ErrorShell>
      <DriftingLogo />

      <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-[0.8vh]" style={{ top: "43.55vh" }}>
        <BackHome className="text-[#808080] text-[clamp(11px,1.2vw,17px)] tracking-[-0.03em]" />
        <p
          className="whitespace-nowrap font-runde leading-none tracking-[-0.05em] text-[#E0E0E0] dark:text-[#292929] transition-colors duration-300"
          style={{ fontSize: "clamp(40px,5vw,70px)" }}
        >
          404
        </p>
      </div>
    </ErrorShell>
  );
}
