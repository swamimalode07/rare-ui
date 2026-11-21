"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import ActionButton from "./ActionButton";

// better auth's default, the server rejects anything shorter
const MIN_PASSWORD = 8;

const CALLBACK = "/account";

const INPUT =
  "h-12 w-full rounded-2xl bg-foreground/[0.05] px-4 text-sm font-medium outline-none ring-[#FC4C01]/40 transition-shadow placeholder:text-muted-foreground focus:ring-2";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signingUp = mode === "sign-up";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setPending("email");
    setError(null);
    const { error } = signingUp
      ? await authClient.signUp.email({
          name: String(form.get("name")),
          email,
          password,
          callbackURL: CALLBACK,
        })
      : await authClient.signIn.email({ email, password, callbackURL: CALLBACK });

    if (error) {
      setError(error.message ?? "Something went wrong. Try again.");
      setPending(null);
      return;
    }
    router.push(CALLBACK);
    router.refresh();
  };

  const google = async () => {
    setPending("google");
    setError(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: CALLBACK,
    });
    if (error) {
      setError(error.message ?? "Google sign in failed. Try again.");
      setPending(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <ActionButton variant="subtle" disabled={pending !== null} onClick={google}>
        {pending === "google" ? "Redirecting…" : "Continue with Google"}
      </ActionButton>

      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
        <span className="h-px flex-1 bg-foreground/10" />
        or
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 text-left">
        {signingUp && (
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Name"
            className={INPUT}
          />
        )}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className={INPUT}
        />
        <input
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete={signingUp ? "new-password" : "current-password"}
          placeholder={
            signingUp ? `Password, at least ${MIN_PASSWORD} characters` : "Password"
          }
          className={INPUT}
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <ActionButton type="submit" disabled={pending !== null}>
          {pending === "email"
            ? signingUp
              ? "Creating account…"
              : "Signing in…"
            : signingUp
              ? "Create account"
              : "Sign in"}
        </ActionButton>
      </form>

      <p className="text-sm text-muted-foreground">
        {signingUp ? "Already have an account?" : "New to RareUI?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(signingUp ? "sign-in" : "sign-up");
            setError(null);
          }}
          className="cursor-pointer font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {signingUp ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
