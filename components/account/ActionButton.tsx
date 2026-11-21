import { Squircle } from "@squircle-js/react";
import type { ComponentProps } from "react";
import { CTA_VARIANTS } from "@/components/sponsors/SponsorCta";
import { cn } from "@/lib/utils";

export default function ActionButton({
  variant = "solid",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof CTA_VARIANTS }) {
  return (
    <Squircle asChild cornerRadius={16} cornerSmoothing={1}>
      <button
        type="button"
        {...props}
        className={cn(
          "flex h-12 cursor-pointer items-center justify-center gap-2 px-6 font-runde text-sm font-semibold disabled:cursor-default disabled:opacity-60",
          CTA_VARIANTS[variant],
          className,
        )}
      />
    </Squircle>
  );
}
