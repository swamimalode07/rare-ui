"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import ActionButton from "./ActionButton";

export function BuyProButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <ActionButton
        disabled={pending}
        className="min-w-48 self-start"
        onClick={async () => {
          setPending(true);
          setFailed(false);
          const { error } = await authClient.checkout({ slug: "pro" });
          if (error) {
            setPending(false);
            setFailed(true);
          }
        }}
      >
        {pending ? "Opening checkout…" : "Get RareUI Pro"}
      </ActionButton>
      {failed && (
        <p role="alert" className="text-sm font-medium text-red-500">
          Checkout could not open. Try again in a moment.
        </p>
      )}
    </div>
  );
}

export function BillingButton() {
  const [pending, setPending] = useState(false);

  return (
    <ActionButton
      variant="subtle"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const { error } = await authClient.customer.portal();
        if (error) setPending(false);
      }}
    >
      {pending ? "Opening…" : "Orders and receipts"}
    </ActionButton>
  );
}

export function SignOutButton() {
  const router = useRouter();

  return (
    <ActionButton
      variant="subtle"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </ActionButton>
  );
}
