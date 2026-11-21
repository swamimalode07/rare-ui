"use client";

import { useRef } from "react";
import Link from "next/link";
import { Squircle } from "@squircle-js/react";
import { motion, useReducedMotion } from "motion/react";
import HeroCta from "@/components/HeroCta";
import { ClaudeLogo, CursorLogo, OpenaiLogo, VscodeLogo } from "@/components/logos";
import PetalField from "./PetalField";

const spring = { type: "spring", stiffness: 260, damping: 24 } as const;
const STEP = 0.09;

const AGENTS = [
  { name: "Claude", Logo: ClaudeLogo },
  { name: "Cursor", Logo: CursorLogo },
  { name: "Codex", Logo: OpenaiLogo },
  { name: "VS Code", Logo: VscodeLogo },
];

export default function ProHero() {
  const flowerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const rise = (index: number) => ({
    initial: reduceMotion ? false : { y: 18, opacity: 0, filter: "blur(6px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    transition: reduceMotion ? { duration: 0 } : { ...spring, delay: 0.35 + index * STEP },
  });

  return (
    <>
      <PetalField flowerRef={flowerRef} veilRef={veilRef} />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-28 text-center sm:px-6 md:pt-32">
        <div ref={flowerRef} aria-hidden="true" className="size-32 sm:size-44" />

        <div ref={veilRef} className="mt-12 flex flex-col items-center sm:mt-16">
          <motion.h1
            {...rise(0)}
            className="max-w-4xl text-balance font-runde text-[2.6rem] font-bold leading-[0.95] tracking-[-0.045em] text-black dark:text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Tasteful components,
            <br />
            <span className="text-black/40 dark:text-white/45">made to stand out.</span>
          </motion.h1>

          <motion.p
            {...rise(1)}
            className="mt-6 max-w-xl text-balance font-medium text-black/60 dark:text-white/60 sm:text-lg"
          >
            Rare animated React components you would never find time to build.
            Each one installs with the shadcn CLI as a single file you own.
          </motion.p>

          <motion.div {...rise(2)} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <HeroCta />
            <Squircle asChild cornerRadius={16} cornerSmoothing={1}>
              <Link
                href="/components"
                className="mt-4 flex h-12 items-center bg-black/[0.06] ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08] px-6 font-runde text-sm font-semibold text-black transition-colors duration-150 ease-out hover:bg-black/[0.1] dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.13]"
              >
                Browse components
              </Link>
            </Squircle>
          </motion.div>

          <motion.div
            {...rise(3)}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] font-medium text-black/50 dark:text-white/50"
          >
            <span>Works with</span>
            <span className="sr-only">{AGENTS.map((agent) => agent.name).join(", ")}</span>
            <span aria-hidden="true" className="flex items-center gap-2.5 text-black/75 dark:text-white/75">
              {AGENTS.map(({ name, Logo }) => (
                <Logo key={name} className="size-4" />
              ))}
            </span>
            <span>and any agent that speaks shadcn</span>
          </motion.div>
        </div>
      </div>
    </>
  );
}
