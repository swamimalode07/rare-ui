import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import SponsorCta from "@/components/sponsors/SponsorCta";
import { fetchStarCount } from "@/lib/github";
import { MERCHANT_NAME, SUPPORT_EMAIL } from "@/lib/legal";
import {
  SPONSOR_ASSET_CHECKLIST,
  SPONSOR_X_URL,
  tierByParam,
} from "@/lib/sponsors";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank you",
  description: `Your ${SITE_NAME} sponsorship is confirmed. Here is what we need to get your logo live.`,
  robots: {
    index: false,
    follow: false,
  },
};

function CheckBadge() {
  return (
    <span className="flex size-14 items-center justify-center rounded-full bg-[#FC4C01]/10 text-[#FC4C01]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    </span>
  );
}

export default async function SponsorThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [stars, params] = await Promise.all([fetchStarCount(), searchParams]);

  const tier = tierByParam(params.tier);

  const subject = tier
    ? `${SITE_NAME} ${tier.name} sponsorship assets`
    : `${SITE_NAME} sponsorship assets`;

  return (
    <>
      <GooeyNavbar stars={stars} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-32 sm:px-6 md:pt-40">
        <header className="flex flex-col items-center gap-5 text-center">
          <CheckBadge />

          <h1 className="text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl">
            {tier
              ? `You are a ${tier.name} sponsor. Thank you.`
              : "You are a sponsor. Thank you."}
          </h1>

          <p className="max-w-lg text-balance font-medium text-muted-foreground">
            Your payment went through and {MERCHANT_NAME} has emailed your
            receipt. {SITE_NAME} stays free and open source because of this, and
            that is not a small thing.
          </p>
        </header>

        <section className="mt-14 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-runde text-xl font-bold tracking-tight">
              What we need from you
            </h2>
            <p className="text-sm text-muted-foreground">
              Send these over and your placement goes live within 3 business
              days.
            </p>
          </div>

          <ol className="flex flex-col gap-4">
            {SPONSOR_ASSET_CHECKLIST.map((item, index) => (
              <li
                key={item.title}
                className="flex items-start gap-4 rounded-3xl bg-card/60 p-5 dark:bg-muted/60"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] font-runde text-xs font-bold tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-runde text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-3">
            <SponsorCta
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`}
              className="min-w-48"
            >
              Email your assets
            </SponsorCta>
            <SponsorCta
              href={SPONSOR_X_URL}
              variant="subtle"
              className="min-w-44"
            >
              DM on X
            </SponsorCta>
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-3 border-t border-foreground/[0.08] pt-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            Your subscription renews monthly until you cancel. You can cancel or
            update your card from the billing portal link in your{" "}
            {MERCHANT_NAME} receipt, and your placement stays live until the end
            of the period you have paid for.
          </p>
          <p>
            Anything at all, reply to your receipt or email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-out hover:decoration-foreground"
            >
              {SUPPORT_EMAIL}
            </a>
            . The full terms are on the{" "}
            <Link
              href="/terms"
              className="text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-out hover:decoration-foreground"
            >
              Terms of Service
            </Link>{" "}
            page.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
