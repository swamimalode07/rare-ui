import { Squircle } from "@squircle-js/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  solid:
    "bg-[#FC4C01] text-white transition-colors duration-150 ease-out hover:bg-[#e64500]",
  subtle:
    "bg-black/[0.06] text-foreground transition-colors duration-150 ease-out hover:bg-black/[0.1] dark:bg-white/10 dark:hover:bg-white/[0.16]",
} as const;

export default function ActionButton({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof VARIANTS }) {
  return (
    <Squircle asChild cornerRadius={16} cornerSmoothing={1}>
      <button
        type="button"
        {...props}
        className={cn(
          "flex h-12 cursor-pointer items-center justify-center gap-2 px-6 font-runde text-sm font-semibold disabled:cursor-default disabled:opacity-60",
          VARIANTS[variant],
          className,
        )}
      />
    </Squircle>
  );
}
