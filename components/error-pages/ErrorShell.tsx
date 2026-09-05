import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const CANVAS = "#171717";
export const INK = "#292929";
export const MUTED_LINK = "#808080";
export const FLAME = "#FC4C01";

// the error screens own the viewport outright, so nothing can scroll behind them
export function ErrorShell({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="error-shell"
      className={cn(
        "fixed inset-0 overflow-hidden bg-[#171717] select-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
