import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GooeyNavbar from "@/components/GooeyNavbar";
import AuthForm from "@/components/account/AuthForm";
import { getSession } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${SITE_NAME} to get and manage your Pro license.`,
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/account");

  return (
    <>
      <GooeyNavbar />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-8 px-5 pb-24 pt-32 text-center md:pt-40">
        <header className="flex flex-col items-center gap-3">
          <h1 className="font-runde text-3xl font-bold tracking-tight">
            Sign in to {SITE_NAME}
          </h1>
          <p className="text-balance font-medium text-muted-foreground">
            Your Pro license and CLI token live on your account.
          </p>
        </header>

        <AuthForm />
      </main>
    </>
  );
}
