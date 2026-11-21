"use client";

import { useState } from "react";
import Link from "next/link";
import { Squircle } from "@squircle-js/react";
import { motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

const GROW_PX = 18;

function StretchSquircleBg({
  hovered,
  className,
  bgClassName,
}: {
  hovered: boolean;
  className?: string;
  bgClassName: string;
}) {
  const reduceMotion = useReducedMotion();
  const [ref, bounds] = useMeasure();
  const scaleX =
    hovered && !reduceMotion && bounds.width > 0
      ? (bounds.width + GROW_PX) / bounds.width
      : 1;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ scaleX }}
      transition={spring}
      className={cn("absolute inset-0", className)}
    >
      <Squircle asChild cornerRadius={16} cornerSmoothing={1}>
        <div className={cn("size-full", bgClassName)} />
      </Squircle>
    </motion.div>
  );
}

export default function HeroCta() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative mt-4 shrink-0"
    >
      <StretchSquircleBg
        hovered={hovered}
        bgClassName="bg-[#FC4C01] transition-colors duration-150 ease-out group-hover:bg-[#e64500]"
      />
      <Link
        href="/account"
        className="relative flex h-12 items-center px-6 font-runde text-sm font-semibold text-white"
      >
        Get RareUI Pro
      </Link>
    </motion.div>
  );
}
