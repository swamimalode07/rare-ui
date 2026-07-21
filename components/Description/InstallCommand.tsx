"use client";

import { useState } from "react";
import {
  installCommand,
  PACKAGE_MANAGERS,
  type ComponentItem,
  type PackageManager,
} from "@/lib/components";
import { cn } from "@/lib/utils";
import { LOGOS } from "../logos";
import CopyButton from "../CopyButton";
import Tooltip from "../Tooltip";

const ACTIVE_COLOR: Record<PackageManager, string> = {
  npm: "#CB3837", 
  pnpm: "#F9AD00", 
  yarn: "#38BDF8",
  bun: "#FFFFFF",
};

export default function InstallCommand({ item }: { item: ComponentItem }) {
  const [pm, setPm] = useState<PackageManager>("npm");
  const command = installCommand(item, pm);
  if (!command) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {PACKAGE_MANAGERS.map((manager) => {
          const Logo = LOGOS[manager];
          const active = pm === manager;
          return (
            <button
              key={manager}
              type="button"
              onClick={() => setPm(manager)}
              data-active={active}
              style={active ? { color: ACTIVE_COLOR[manager] } : undefined}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-muted"
                  : "text-foreground/40 hover:text-foreground/70",
              )}
            >
              <Logo className="size-3.5" />
              {manager}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-muted p-2 pl-3">
        <code className="flex-1 truncate text-xs text-foreground/80">
          {command}
        </code>
        <Tooltip label="Copy command" align="end">
          <CopyButton value={command} title="" />
        </Tooltip>
      </div>
    </div>
  );
}
