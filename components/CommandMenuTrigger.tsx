"use client";

import { Squircle } from "@squircle-js/react";
import { cn } from "@/lib/utils";

export const OPEN_EVENT = "rareui:command-menu";

export const openCommandMenu = () =>
  window.dispatchEvent(new Event(OPEN_EVENT));

export const preloadCommandMenu = () => void import("./CommandMenu");

export const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    aria-hidden
    className={className}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export function CommandMenuTrigger({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Squircle asChild cornerRadius={9} cornerSmoothing={1}>
      <button
        type="button"
        aria-label="Search components"
        aria-keyshortcuts="Meta+K Control+K"
        onPointerEnter={preloadCommandMenu}
        onFocus={preloadCommandMenu}
        onClick={() => {
          onClick?.();
          openCommandMenu();
        }}
        className={cn(
          "flex h-7 min-w-7 shrink-0 cursor-pointer items-center justify-center bg-[#F4F4F9] px-2 font-runde text-[12px] font-semibold text-[#868593] outline-none transition-[color,transform] duration-200 hover:text-black focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FC4C01]/60 active:scale-95 motion-reduce:transition-none dark:bg-popover dark:hover:text-white",
          className,
        )}
      >
        {/* touch screens have no keyboard shortcut to show, so they get the icon */}
        <SearchIcon className="size-3.5 [@media(hover:hover)]:hidden" />
        <kbd className="hidden font-runde tracking-wide [@media(hover:hover)]:inline">
          ⌘K
        </kbd>
      </button>
    </Squircle>
  );
}
