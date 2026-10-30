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
    <Squircle asChild cornerRadius={11} cornerSmoothing={1}>
      <button
        type="button"
        onPointerEnter={preloadCommandMenu}
        onFocus={preloadCommandMenu}
        onClick={() => {
          onClick?.();
          openCommandMenu();
        }}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center gap-2 bg-[#F4F4F9] pl-3 pr-1.5 font-runde text-[13px] font-semibold text-[#868593] outline-none transition-[color,transform] duration-200 hover:text-black focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FC4C01]/60 active:scale-[0.98] motion-reduce:transition-none dark:bg-popover dark:hover:text-white",
          className,
        )}
      >
        <SearchIcon className="size-3.5" />
        Search components
        <span className="ml-auto hidden items-center gap-0.5 [@media(hover:hover)]:flex">
          <kbd className="grid h-5 min-w-5 place-items-center rounded-[6px] bg-white px-1 text-[10px] font-semibold dark:bg-[#1C1C1E]">
            ⌘
          </kbd>
          <kbd className="grid h-5 min-w-5 place-items-center rounded-[6px] bg-white px-1 text-[10px] font-semibold dark:bg-[#1C1C1E]">
            K
          </kbd>
        </span>
      </button>
    </Squircle>
  );
}
