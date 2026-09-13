"use client";

import type { ComponentProps } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const CANVAS = "bg-white dark:bg-[#171717]";
export const INK = "#292929";
export const MUTED_LINK = "#808080";
export const FLAME = "#FC4C01";

// the error screens own the viewport outright, so nothing can scroll behind them
export function ErrorShell({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="error-shell"
      className={cn(
        "fixed inset-0 overflow-hidden bg-white dark:bg-[#171717] text-foreground select-none transition-colors duration-300",
        className,
      )}
      {...props}
    >
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle className="rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 p-2 text-foreground/80 hover:text-foreground transition-colors" />
      </div>
      {children}
    </div>
  );
}
