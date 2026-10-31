"use client";

import { motion, useReducedMotion } from "motion/react";
import { useHalloween } from "@/lib/halloween";
import { HALLOWEEN_WEBS_ENABLED } from "@/lib/site";

const SpiderIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 34" fill="currentColor" className={className}>
    <path
      d="M18.5 17.5L12.5 9.5L8.5 12M18.5 18.5L11 14L6 18M18.5 19.5L11.5 20L7 26M19 20.5L14.5 25L13 31M21.5 17.5L27.5 9.5L31.5 12M21.5 18.5L29 14L34 18M21.5 19.5L28.5 20L33 26M21 20.5L25.5 25L27 31"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse cx="20" cy="12.5" rx="3.2" ry="4.2" />
    <circle cx="20" cy="19" r="2.4" />
  </svg>
);

export default function SpiderWebs() {
  const show = useHalloween(HALLOWEEN_WEBS_ENABLED);
  const reduceMotion = useReducedMotion();

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 text-black/25 dark:text-white/30"
    >
      <div className="absolute right-0 top-0 aspect-[320/340] w-56 md:w-80">
        <div className="absolute inset-0 bg-current [mask-image:url(/halloween/web-top-right.svg)] [mask-size:100%_100%]" />

        {/* left/top match the hub at (235, 62) in web-top-right.svg */}
        <motion.div
          className="absolute left-[73.4%] top-[18.2%] flex w-[8%] -translate-x-1/2 flex-col items-center"
          style={{ originY: 0 }}
          animate={reduceMotion ? {} : { rotate: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="block w-px bg-current"
            initial={{ height: reduceMotion ? 120 : 0 }}
            animate={reduceMotion ? {} : { height: [0, 128, 114, 123, 120] }}
            transition={{
              duration: 2.4,
              ease: "easeOut",
              times: [0, 0.45, 0.65, 0.85, 1],
            }}
          />
          <SpiderIcon className="-mt-2 w-full text-neutral-600 dark:text-neutral-400" />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 aspect-[320/150] w-56 bg-current [mask-image:url(/halloween/web-bottom-left.svg)] [mask-size:100%_100%] md:w-80" />
    </div>
  );
}
