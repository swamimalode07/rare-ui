"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Squircle } from "@squircle-js/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GithubLogo, RareuiLogo, XLogo } from "@/components/logos";
import { SITE_REPO } from "@/lib/site";
import { TIERS_HREF } from "@/lib/sponsors";

const X_URL = "https://x.com/rareuiHQ";
const SEEN_KEY = "rareui:star-prompt-seen";
const SHOWN_KEY = "rareui:star-prompt-shown";
const DELAY = 8_000;
const MAX_SHOWS = 2;
const GAP = 5 * 24 * 60 * 60 * 1000;

type Shown = { count: number; last: number };

function readShown(): Shown {
  try {
    const saved = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? "null");
    if (typeof saved?.count === "number" && typeof saved?.last === "number") {
      return saved;
    }
  } catch {}
  // visitors from the single-show version have used one of their two showings
  return localStorage.getItem(SEEN_KEY)
    ? { count: 1, last: 0 }
    : { count: 0, last: 0 };
}

// card radius = button radius + padding, so the corners stay concentric
const PADDING = 12;
const BUTTON_RADIUS = 11;
const CARD_RADIUS = BUTTON_RADIUS + PADDING;

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;

export function StarPrompt({ monthlyViews }: { monthlyViews: string }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const onSponsors = usePathname().startsWith("/sponsors");

  useEffect(() => {
    if (onSponsors) return;
    const shown = readShown();
    if (shown.count >= MAX_SHOWS || Date.now() - shown.last < GAP) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        SHOWN_KEY,
        JSON.stringify({ count: shown.count + 1, last: Date.now() }),
      );
      setOpen(true);
    }, DELAY);
    return () => clearTimeout(timer);
  }, [onSponsors]);

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
                      Sponsor it, star the repo, or follow along on X for new
                      components.
                    </p>
                  </div>


                  <div className="mt-4 flex gap-2">
                    <Squircle asChild cornerRadius={BUTTON_RADIUS} cornerSmoothing={1}>
                      <a
                        href={SITE_REPO}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 bg-[linear-gradient(135deg,#FBF1D3,#F4E2AE)] text-[13px] font-semibold text-[#7A5300] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition-[filter,transform] hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F2C14E]/70 dark:bg-[linear-gradient(135deg,#3B3018,#2B2414)] dark:text-[#F2C14E] dark:shadow-[inset_0_1px_0_rgba(255,214,120,0.12)] dark:hover:brightness-125 active:scale-[0.97] motion-reduce:transition-none"
                      >
                        <GithubLogo className="size-3.5" />
                        Star
                      </a>
                    </Squircle>
                    <Squircle asChild cornerRadius={BUTTON_RADIUS} cornerSmoothing={1}>
                      <a
                        href={X_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 bg-[#F4F4F9] text-[13px] font-semibold text-[#5E5D68] outline-none transition-[background-color,color,transform] hover:bg-[#EDEDF3] hover:text-black focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FC4C01]/60 active:scale-[0.97] motion-reduce:transition-none dark:bg-[#2C2C2E] dark:text-[#A1A0AB] dark:hover:bg-[#3A3A3C] dark:hover:text-white"
                      >
                        <XLogo className="size-3" />
                        Follow
                      </a>
                    </Squircle>
                  </div>

                  <Squircle asChild cornerRadius={BUTTON_RADIUS} cornerSmoothing={1}>
                    <Link
                      href={TIERS_HREF}
                      onClick={() => setOpen(false)}
                      data-track="sponsor_nudge"
                      data-placement="star_prompt"
                      className="group mt-2 flex items-center gap-2.5 bg-[linear-gradient(135deg,#FF6A1F,#FC4C01_55%,#E54400)] p-2 pr-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] outline-none transition-[filter,transform] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 active:scale-[0.98] motion-reduce:transition-none"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                        <svg width="0" height="0" className="absolute" aria-hidden>
                          <linearGradient id="rareui-gold" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#FFF3C4" />
                            <stop offset="0.45" stopColor="#F6C94C" />
                            <stop offset="1" stopColor="#C8891A" />
                          </linearGradient>
                        </svg>
                        <RareuiLogo className="size-[18px] fill-[url(#rareui-gold)]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold leading-4">
                          Become a sponsor
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] font-medium leading-4 text-white/75">
                          Your logo, {monthlyViews} views a month
                        </span>
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3.5 shrink-0 text-white/80 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </Squircle>
                </div>
              </Squircle>
            </div>
          </Squircle>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
