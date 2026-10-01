"use client";

import { useId } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const ContrastIcon = ({ className }: { className?: string }) => {
  const clipId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M13 3.5a8 8 0 0 1 0 17z" />
        </clipPath>
      </defs>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 3l0 18" />
      <g clipPath={`url(#${clipId})`}>
        <path d="M12 9l6 -6" strokeLinecap="butt" />
        <path d="M12 14.3l8.5 -8.5" strokeLinecap="butt" />
        <path d="M12 19.6l10 -10" strokeLinecap="butt" />
      </g>
    </svg>
  );
};

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "cursor-pointer rounded-lg bg-secondary p-2 text-foreground transition-colors",
        className,
      )}
    >
      <ContrastIcon className="h-5 w-5" />
    </button>
  );
}
