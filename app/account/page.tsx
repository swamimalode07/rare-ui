import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GooeyNavbar from "@/components/GooeyNavbar";
import TokenPanel from "@/components/account/TokenPanel";
import {
  BillingButton,
  BuyProButton,
  SignOutButton,
} from "@/components/account/AccountActions";
import { getSession } from "@/lib/auth";
import { activeLicense, hasPurchased, tokenPrefix } from "@/lib/license";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account",
  description: `Your ${SITE_NAME} account and Pro license.`,
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  if (!session) redirect("/sign-in");

  const [license, prefix, purchased] = await Promise.all([
    activeLicense(session.user.id),
    tokenPrefix(session.user.id),
    hasPurchased(session.user.id),
  ]);
  // the webhook can land a few seconds after polar redirects back here
  const justPaid = !license && Boolean(params.checkout_id);

  return (
    <>
      <GooeyNavbar />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 pb-24 pt-32 sm:px-6 md:pt-40">
        <header className="flex flex-col gap-2">
          <h1 className="font-runde text-3xl font-bold tracking-tight sm:text-4xl">
            {session.user.name || "Your account"}
          </h1>
          <p className="font-medium text-muted-foreground">
            {session.user.email}
          </p>
        </header>

        <section className="flex flex-col gap-5 rounded-3xl bg-card/60 p-6 dark:bg-muted/60">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-runde text-xl font-bold tracking-tight">
              {SITE_NAME} Pro
            </h2>
            <span className="rounded-full bg-foreground/[0.06] px-3 py-1 font-runde text-xs font-semibold text-muted-foreground">
              {license ? "Active" : justPaid ? "Processing" : "No license"}
            </span>
          </div>

          {license ? (
            <TokenPanel prefix={prefix} />
          ) : justPaid ? (
            <p className="text-sm text-muted-foreground">
              Payment received. Your license is being set up, refresh in a few
              seconds.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Unlock every Pro component on the site and in the shadcn CLI.
              </p>
              <BuyProButton />
            </>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          {purchased && <BillingButton />}
          <SignOutButton />
        </div>
      </main>
    </>
  );
}
