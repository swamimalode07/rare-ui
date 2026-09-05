"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const ARROW = { duration: 0.28, ease: EASE_OUT } as const;

const arrow = {
  rest: { x: 0 },
  nudge: { x: -5 },
};

export function BackHome({ className }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.span
      initial="rest"
      animate="rest"
      whileHover={reduced ? undefined : "nudge"}
      whileFocus={reduced ? undefined : "nudge"}
      className="inline-block"
    >
      <Link
        href="/"
        data-slot="back-home"
        className={cn(
          "inline-flex items-baseline whitespace-nowrap font-runde underline decoration-solid underline-offset-[3px]",
          "text-[clamp(15px,1.67vw,24px)] leading-none tracking-[-0.02em]",
          "outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#171717]",
          className,
        )}
      >
        <motion.span aria-hidden variants={arrow} transition={ARROW} className="inline-block">
          {"<-"}
        </motion.span>
        Back to home
      </Link>
    </motion.span>
  );
}
