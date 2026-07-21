"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const OPEN_DELAY_MS = 400;
const SKIP_DELAY_MS = 400;

const ALIGN = {
  center: { pill: "left-1/2 -translate-x-1/2", arrow: "left-1/2 -ml-2" },
  start: { pill: "left-0", arrow: "left-2" },
  end: { pill: "right-0", arrow: "right-1.5" },
} as const;

const PILL =
  "pointer-events-none absolute top-full z-50 mt-2.5 block whitespace-nowrap rounded-xl bg-popover px-3 py-1.5 text-sm font-medium text-foreground shadow-lg";

let lastClosedAt = 0;

function useDelayedHover() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    if (Date.now() - lastClosedAt < SKIP_DELAY_MS) {
      setOpen(true);
      return;
    }
    timer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    if (open) lastClosedAt = Date.now();
    setOpen(false);
  };

  return { open, show, hide };
}

function TooltipArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 9"
      className={cn("absolute -top-2 h-[9px] w-4", className)}
    >
      <path d="M0 9L5.6 2.2Q8 0 10.4 2.2L16 9Z" className="fill-popover" />
    </svg>
  );
}

type TooltipProps = {
  label: string;
  align?: keyof typeof ALIGN;
  className?: string;
  children: React.ReactNode;
};

export default function Tooltip({
  label,
  align = "center",
  className,
  children,
}: TooltipProps) {
  const { open, show, hide } = useDelayedHover();
  const position = ALIGN[align];

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className={cn("relative flex", className)}
    >
      {children}

      {open && (
        <span role="tooltip" className={cn(PILL, position.pill)}>
          <TooltipArrow className={position.arrow} />
          {label}
        </span>
      )}
    </div>
  );
}
