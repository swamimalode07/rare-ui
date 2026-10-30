"use client";

import { useEffect, useState } from "react";
import { Squircle } from "@squircle-js/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GithubLogo, XLogo } from "@/components/logos";
import { SITE_REPO } from "@/lib/site";

const X_URL = "https://x.com/rareuiHQ";
const SEEN_KEY = "rareui:star-prompt-seen";
const DELAY = 8_000;

// card radius = button radius + padding, so the corners stay concentric
const PADDING = 12;
const BUTTON_RADIUS = 11;
const CARD_RADIUS = BUTTON_RADIUS + PADDING;

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;

export function StarPrompt() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    const timer = setTimeout(() => {
      localStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
    }, DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-labelledby="star-prompt-title"
          aria-describedby="star-prompt-body"
          // past its own width plus the edge gap, so it starts fully off screen
          initial={reduceMotion ? { opacity: 0 } : { x: "120%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { x: "120%" }}
          transition={reduceMotion ? { duration: 0.15 } : spring}
          // drop-shadow, since a box-shadow would be cut off by the squircle clip
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] font-runde [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.05))_drop-shadow(0_2px_4px_rgba(0,0,0,0.05))_drop-shadow(0_6px_10px_rgba(0,0,0,0.06))] sm:bottom-6 sm:right-6 sm:w-[300px] dark:[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0_2px_4px_rgba(0,0,0,0.35))_drop-shadow(0_6px_10px_rgba(0,0,0,0.4))]"
        >
          {/* the outer squircle shows through the 1px gap as a hairline, which a border can't do on a clipped shape */}
          <Squircle asChild cornerRadius={CARD_RADIUS + 1} cornerSmoothing={1}>
            <div className="bg-black/[0.07] p-px dark:bg-white/10">
              <Squircle asChild cornerRadius={CARD_RADIUS} cornerSmoothing={1}>
                <div
                  style={{ padding: PADDING }}
                  className="relative bg-white dark:bg-[#1C1C1E]"
                >
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                    className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-full text-[#A1A0AB] outline-none transition-colors hover:bg-[#F4F4F9] hover:text-black focus-visible:ring-2 focus-visible:ring-[#FC4C01]/60 motion-reduce:transition-none dark:text-[#6E6D78] dark:hover:bg-[#2C2C2E] dark:hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M7 7l10 10M17 7L7 17" />
                    </svg>
                  </button>

                  <div className="px-1 pt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logos/Rareui.svg" alt="" className="size-7" />

                    <h2
                      id="star-prompt-title"
                      className="mt-3.5 text-[15px] font-semibold leading-5 tracking-[-0.01em] text-black dark:text-white"
                    >
                      Liking Rare UI so far?
                    </h2>
                    <p
                      id="star-prompt-body"
                      className="mt-1 text-[13px] font-medium leading-[18px] text-[#868593]"
                    >
                      Star the repo and follow along on X for new components.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Squircle asChild cornerRadius={BUTTON_RADIUS} cornerSmoothing={1}>
                      <a
                        href={X_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 bg-[#F4F4F9] text-[13px] font-semibold text-black outline-none transition-[background-color,transform] hover:bg-[#EDEDF3] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FC4C01]/60 active:scale-[0.97] motion-reduce:transition-none dark:bg-[#2C2C2E] dark:text-white dark:hover:bg-[#3A3A3C]"
                      >
                        <XLogo className="size-3" />
                        Follow
                      </a>
                    </Squircle>
                    <Squircle asChild cornerRadius={BUTTON_RADIUS} cornerSmoothing={1}>
                      <a
                        href={SITE_REPO}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 bg-[#FC4C01] text-[13px] font-semibold text-white outline-none transition-[background-color,transform] hover:bg-[#E54400] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 active:scale-[0.97] motion-reduce:transition-none"
                      >
                        <GithubLogo className="size-3.5" />
                        Star
                      </a>
                    </Squircle>
                  </div>
                </div>
              </Squircle>
            </div>
          </Squircle>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
