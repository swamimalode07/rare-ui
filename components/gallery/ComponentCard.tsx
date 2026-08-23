"use client";

import { useState } from "react";
import Link from "next/link";
import type { ComponentItem } from "@/lib/components";
import { cn } from "@/lib/utils";
import PreviewFallback from "./PreviewFallback";
import PreviewVideo from "./PreviewVideo";

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export default function ComponentCard({
  item,
  large = false,
  autoPlay = false,
  className,
}: {
  item: ComponentItem;
  large?: boolean;
  autoPlay?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        "group flex flex-col rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-2 transition-colors duration-200 ease-out dark:border-transparent dark:border-apple dark:bg-[#121212] dark:hover:bg-muted",
        large && "lg:h-full",
        className,
      )}
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      <div
        className={cn(
          "relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-black/[0.06] bg-white dark:border-neutral-500/15 dark:bg-neutral-950",
          large && "lg:aspect-auto lg:flex-1",
        )}
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {item.preview ? (
          <PreviewVideo
            src={item.preview}
            playing={active}
            autoPlay={autoPlay}
          />
        ) : (
          <PreviewFallback />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-runde text-base font-semibold tracking-tight">
            {item.name}
            {item.isNew && (
              <span className="rounded-full bg-[#FC4C01]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#FC4C01]">
                New
              </span>
            )}
          </h3>
          {/* {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )} */}
        </div>
        <span className="flex shrink-0 items-center justify-center text-[#FC4C01]">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
