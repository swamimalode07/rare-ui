"use client";

import { useState } from "react";
import Link from "next/link";
import { Squircle } from "@squircle-js/react";
import { motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";
import CopyButton from "@/components/CopyButton";
import { cn } from "@/lib/utils";

const INSTALL_COMMAND = "npx shadcn add @rare-ui/fluid-orb";

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

const GROW_PX = 18;
const SIDE_SHIFT = GROW_PX / 2;

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
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<"pill" | "cta" | null>(null);
  const shift = (px: number) => (reduceMotion ? 0 : px);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <motion.div
        initial={false}
        animate={{ x: hovered === "cta" ? shift(-SIDE_SHIFT) : 0 }}
        transition={spring}
        onHoverStart={() => setHovered("pill")}
        onHoverEnd={() => setHovered((h) => (h === "pill" ? null : h))}
        className="relative max-w-full"
      >
        <StretchSquircleBg
          hovered={hovered === "pill"}
          bgClassName="bg-neutral-900"
        />
        <CopyButton
          value={INSTALL_COMMAND}
          label="Copy command"
          className="relative h-12 max-w-full flex-row-reverse gap-2 pl-4 pr-4 text-white/50 hover:text-white sm:pl-5"
        >
          <code className="overflow-x-auto whitespace-nowrap font-mono text-xs font-semibold text-white sm:text-sm">
            npx shadcn add @rare-ui
            <span className="font-normal text-white/50">/fluid-orb</span>
          </code>
        </CopyButton>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ x: hovered === "pill" ? shift(SIDE_SHIFT) : 0 }}
        transition={spring}
        onHoverStart={() => setHovered("cta")}
        onHoverEnd={() => setHovered((h) => (h === "cta" ? null : h))}
        className="group relative"
      >
        <StretchSquircleBg
          hovered={hovered === "cta"}
          bgClassName="bg-[#FC4C01] transition-colors duration-150 ease-out group-hover:bg-[#e64500]"
        />
        <Link
          href="/components"
          className="relative flex h-12 items-center px-6 text-sm font-semibold font-rund text-white"
        >
          Quick Start
        </Link>
      </motion.div>
    </div>
  );
}
