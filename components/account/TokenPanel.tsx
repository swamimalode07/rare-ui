"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import CopyButton from "@/components/CopyButton";
import { SITE_URL } from "@/lib/site";
import { createToken } from "@/app/account/actions";
import ActionButton from "./ActionButton";

const ENV_NAME = "RAREUI_PRO_TOKEN";

const REGISTRY_SNIPPET = JSON.stringify(
  {
    registries: {
      "@rareui-pro": {
        url: `${SITE_URL}/r/pro/{name}.json`,
        headers: { Authorization: `Bearer \${${ENV_NAME}}` },
      },
    },
  },
  null,
  2,
);

function CodeRow({ value }: { value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-foreground/[0.04] p-3">
      <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-xs leading-relaxed">
        {value}
      </pre>
      <CopyButton value={value} className="hover:text-foreground" />
    </div>
  );
}

export default function TokenPanel({ prefix }: { prefix: string | null }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const hasToken = Boolean(token || prefix);

  return (
    <div className="flex flex-col gap-5">
      {token ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Copy this now. It will not be shown again.
          </p>
          <CodeRow value={`${ENV_NAME}=${token}`} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {prefix
            ? `Your current token starts with ${prefix}. Making a new one stops the old one working.`
            : "Make a token to install Pro components with the shadcn CLI."}
        </p>
      )}

      <ActionButton
        variant={hasToken ? "subtle" : "solid"}
        disabled={pending}
        className="self-start"
        onClick={() =>
          startTransition(async () => {
            const next = await createToken();
            setFailed(!next);
            if (next) setToken(next);
            else router.refresh();
          })
        }
      >
        {pending ? "Making token…" : hasToken ? "Replace token" : "Make token"}
      </ActionButton>

      {failed && (
        <p role="alert" className="text-sm font-medium text-red-500">
          Could not make a token. Your session or license may have changed.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Add the registry to your project&apos;s components.json, and put the
          token in .env.local:
        </p>
        <CodeRow value={REGISTRY_SNIPPET} />
        <CodeRow value="npx shadcn@latest add @rareui-pro/<component>" />
      </div>
    </div>
  );
}
