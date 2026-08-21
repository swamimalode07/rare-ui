import { Squircle } from "@squircle-js/react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  solid:
    "bg-[#FC4C01] text-white transition-colors duration-150 ease-out hover:bg-[#e64500]",
  subtle:
    "bg-black/[0.06] text-foreground transition-colors duration-150 ease-out hover:bg-black/[0.1] dark:bg-white/10 dark:hover:bg-white/[0.16]",
} as const;

export default function SponsorCta({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const external = href.startsWith("http");

  return (
    <Squircle asChild cornerRadius={16} cornerSmoothing={1}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={cn(
          "flex h-12 items-center justify-center px-6 font-runde text-sm font-semibold",
          VARIANTS[variant],
          className,
        )}
      >
        {children}
      </a>
    </Squircle>
  );
}
