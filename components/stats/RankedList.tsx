"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn, formatNumber } from "@/lib/utils";

export type RankedRow = {
  id: string;
  label: string;
  href?: string;
  value: number;
  meta?: string;
};

const spring = { type: "spring", stiffness: 180, damping: 28 } as const;

const list = { shown: { transition: { staggerChildren: 0.04 } } };

const bar = { hidden: { scaleX: 0 }, shown: { scaleX: 1 } };

export default function RankedList({
  rows,
  unit,
}: {
  rows: RankedRow[];
  unit: string;
}) {
  const reduceMotion = useReducedMotion();
  const top = Math.max(...rows.map((row) => row.value), 1);

  return (
    <motion.ul
      initial={reduceMotion ? "shown" : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.1 }}
      variants={list}
      className="flex w-full flex-col gap-1.5"
    >
      {rows.map((row, index) => (
        <li
          key={row.id}
          className="relative overflow-hidden rounded-2xl bg-card/60 dark:bg-muted/60"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <motion.div
            aria-hidden="true"
            variants={bar}
            transition={reduceMotion ? { duration: 0 } : spring}
            style={{ width: `${(row.value / top) * 100}%` }}
            className="absolute inset-y-0 left-0 origin-left bg-black/[0.05] dark:bg-white/[0.07]"
          />

          <div className="relative flex items-center gap-3 px-4 py-3 sm:px-5">
            <span className="w-5 shrink-0 font-runde text-sm font-bold tabular-nums text-muted-foreground">
              {index + 1}
            </span>

            <Label href={row.href}>{row.label}</Label>

            {row.meta && (
              <span className="hidden shrink-0 text-xs font-medium tabular-nums text-muted-foreground sm:block">
                {row.meta}
              </span>
            )}

            <span className="ml-auto shrink-0 font-runde text-sm font-bold tabular-nums sm:text-base">
              {formatNumber(row.value)}
              <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                {row.value === 1 ? unit.replace(/s$/, "") : unit}
              </span>
            </span>
          </div>
        </li>
      ))}
    </motion.ul>
  );
}

function Label({ href, children }: { href?: string; children: string }) {
  const className = cn(
    "min-w-0 truncate text-sm font-medium",
    href && "transition-colors duration-150 ease-out hover:text-foreground",
    href ? "text-foreground/80" : "text-foreground",
  );

  if (!href) return <span className={className}>{children}</span>;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
