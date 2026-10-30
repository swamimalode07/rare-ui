"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Squircle } from "@squircle-js/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import PreviewFallback from "@/components/gallery/PreviewFallback";
import PreviewVideo from "@/components/gallery/PreviewVideo";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  components,
  type ComponentItem,
} from "@/lib/components";
import { cn } from "@/lib/utils";
import { OPEN_EVENT, SearchIcon } from "./CommandMenuTrigger";


// card radius = field radius + padding, so the corners stay concentric
const PADDING = 8;
const FIELD_RADIUS = 16;
const CARD_RADIUS = FIELD_RADIUS + PADDING;

const FADE = 28;
const VIDEO_DELAY = 150;

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;


const rankCategory = (item: ComponentItem) => {
  const index = CATEGORY_ORDER.indexOf(item.category);
  return index === -1 ? CATEGORY_ORDER.length : index;
};

const browseOrder = [...components].sort(
  (a, b) => rankCategory(a) - rankCategory(b),
);

const haystacks = new Map(
  components.map((item) => [
    item,
    `${item.name} ${CATEGORY_LABELS[item.category]} ${item.description ?? ""}`.toLowerCase(),
  ]),
);

const search = (query: string): ComponentItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) return browseOrder;

  const terms = q.split(/\s+/);
  const rank = (item: ComponentItem) => {
    const name = item.name.toLowerCase();
    if (name.startsWith(q)) return 0;
    if (name.includes(q)) return 1;
    return 2;
  };

  return browseOrder
    .filter((item) => terms.every((t) => haystacks.get(item)!.includes(t)))
    .sort((a, b) => rank(a) - rank(b));
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const q = query.trim().toLowerCase();
  const start = q ? text.toLowerCase().indexOf(q) : -1;
  if (start === -1) return text;

  return (
    <>
      {text.slice(0, start)}
      <span className="text-[#FC4C01]">
        {text.slice(start, start + q.length)}
      </span>
      {text.slice(start + q.length)}
    </>
  );
};

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="grid h-5 min-w-5 place-items-center rounded-[6px] bg-[#F7F7FA] px-1 font-runde text-[10px] font-semibold text-[#868593] dark:bg-[#121212]">
    {children}
  </kbd>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-4"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const Preview = ({ item }: { item: ComponentItem }) => {
  const [settled, setSettled] = useState(false);

  // skips fetching videos for rows the highlight only passes through
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), VIDEO_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="flex h-full flex-col"
    >
      <div
        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-[18px] border border-black/[0.06] bg-white dark:border-neutral-500/15 dark:bg-neutral-950"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {!item.preview ? (
          <PreviewFallback />
        ) : (
          settled && (
            <PreviewVideo
              src={item.preview}
              scale={item.previewScale}
              playing
            />
          )
        )}
      </div>

      <div className="mt-3.5 shrink-0 px-1 pb-1">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold leading-5 tracking-[-0.01em] text-black dark:text-white">
          {item.name}
          {item.isNew && (
            <span className="rounded-full bg-[#FC4C01]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#FC4C01]">
              New
            </span>
          )}
        </h3>
        {item.description && (
          <p className="mt-1 line-clamp-3 text-[13px] font-medium leading-[18px] text-[#868593]">
            {item.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function CommandMenu({
  initialOpen = false,
}: {
  initialOpen?: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(
    initialOpen && typeof document !== "undefined"
      ? (document.activeElement as HTMLElement | null)
      : null,
  );
  const openRef = useRef(initialOpen);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const results = useMemo(() => search(query), [query]);
  const browsing = !query.trim();
  const activeItem = results[active];

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const show = () => {
      if (openRef.current) return;
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const hide = () => {
      setOpen(false);
      returnFocus.current?.focus();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openRef.current) {
        e.preventDefault();
        return hide();
      }
      // autofill fires keydown events without a key
      if (e.key?.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      if (openRef.current) hide();
      else show();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, []);

  const measureEdges = () => {
    const list = listRef.current;
    if (!list) return;
    const top = list.scrollTop > 0;
    const bottom = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
    setEdges((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom },
    );
  };

  useEffect(measureEdges, [open, results]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => {
    setOpen(false);
    returnFocus.current?.focus();
  };

  const go = (item: ComponentItem | undefined) => {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const count = results.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (count ? (i + 1) % count : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (count ? (i - 1 + count) % count : 0));
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      go(activeItem);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-start justify-center px-4 pt-[12vh] font-runde">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={close}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/60"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search components"
            data-slot="command-menu"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }
            }
            transition={reduceMotion ? { duration: 0.15 } : spring}
            // drop-shadow, since a box-shadow would be cut off by the squircle clip
            className="relative w-full max-w-[760px] [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.05))_drop-shadow(0_12px_32px_rgba(0,0,0,0.12))] dark:[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.35))_drop-shadow(0_16px_40px_rgba(0,0,0,0.5))]"
          >
            {/* the outer squircle shows through the 1px gap as a hairline, which a border can't do on a clipped shape */}
            <Squircle
              asChild
              cornerRadius={CARD_RADIUS + 1}
              cornerSmoothing={1}
            >
              <div className="bg-black/[0.07] p-px dark:bg-white/10">
                <Squircle
                  asChild
                  cornerRadius={CARD_RADIUS}
                  cornerSmoothing={1}
                >
                  <div
                    style={{ padding: PADDING }}
                    className="flex h-[min(480px,72vh)] flex-col bg-white dark:bg-[#1C1C1E]"
                  >
                    <Squircle
                      asChild
                      cornerRadius={FIELD_RADIUS}
                      cornerSmoothing={1}
                    >
                      <label className="flex h-12 shrink-0 cursor-text items-center gap-3 bg-[#F7F7FA] pl-4 pr-3 dark:bg-[#121212]">
                        <SearchIcon className="size-4 shrink-0 text-[#868593]" />
                        <input
                          autoFocus
                          value={query}
                          onChange={(e) => {
                            setQuery(e.target.value);
                            setActive(0);
                          }}
                          onKeyDown={onInputKeyDown}
                          placeholder="Search components"
                          role="combobox"
                          aria-expanded="true"
                          aria-controls="command-menu-list"
                          aria-activedescendant={
                            activeItem
                              ? `command-item-${activeItem.href}`
                              : undefined
                          }
                          className="h-full w-full bg-transparent text-[15px] font-medium text-black caret-[#FC4C01] outline-none placeholder:text-[#A1A0AB] dark:text-white dark:placeholder:text-[#6E6D78]"
                        />
                        <button
                          type="button"
                          aria-label="Close"
                          onClick={close}
                          className="group grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-[8px] bg-white text-[12px] font-semibold text-[#868593] outline-none transition-colors duration-150 hover:text-black focus-visible:ring-2 focus-visible:ring-[#FC4C01]/60 motion-reduce:transition-none sm:w-10 dark:bg-[#2C2C2E] dark:hover:text-white"
                        >
                          <span className="col-start-1 row-start-1 hidden transition-[opacity,filter,scale] duration-200 ease-out group-hover:scale-75 group-hover:opacity-0 group-hover:blur-[2px] group-focus-visible:scale-75 group-focus-visible:opacity-0 group-focus-visible:blur-[2px] motion-reduce:transition-none sm:inline">
                            esc
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            aria-hidden
                            className="col-start-1 row-start-1 size-3.5 transition-[opacity,filter,scale] duration-200 ease-out motion-reduce:transition-none sm:scale-75 sm:opacity-0 sm:blur-[2px] sm:group-hover:scale-100 sm:group-hover:opacity-100 sm:group-hover:blur-none sm:group-focus-visible:scale-100 sm:group-focus-visible:opacity-100 sm:group-focus-visible:blur-none"
                          >
                            <path d="M7 7l10 10M17 7L7 17" />
                          </svg>
                        </button>
                      </label>
                    </Squircle>

                    <div className="mt-2 flex min-h-0 flex-1 gap-2">
                      <div
                        ref={listRef}
                        id="command-menu-list"
                        role="listbox"
                        onScroll={measureEdges}
                        style={{
                          scrollPaddingBlock: FADE,
                          maskImage: `linear-gradient(to bottom, ${
                            edges.top ? "transparent" : "#000"
                          } 0, #000 ${FADE}px, #000 calc(100% - ${FADE}px), ${
                            edges.bottom ? "transparent" : "#000"
                          } 100%)`,
                        }}
                        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-1"
                      >
                        {results.length === 0 ? (
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                            <p className="text-[13px] font-semibold text-black dark:text-white">
                              Nothing rare enough
                            </p>
                            <p className="text-[13px] font-medium text-[#868593]">
                              No components match &ldquo;{query.trim()}&rdquo;
                            </p>
                          </div>
                        ) : (
                          results.map((item, index) => {
                            const selected = index === active;
                            const header =
                              browsing &&
                              item.category !== results[index - 1]?.category;

                            return (
                              <Fragment key={item.href}>
                                {header && (
                                  <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A1A0AB] first:pt-2 dark:text-[#6E6D78]">
                                    {CATEGORY_LABELS[item.category]}
                                  </p>
                                )}
                                <div
                                  id={`command-item-${item.href}`}
                                  role="option"
                                  aria-selected={selected}
                                  data-index={index}
                                  onMouseMove={() => setActive(index)}
                                  onClick={() => go(item)}
                                  className={cn(
                                    "flex h-10 cursor-pointer items-center gap-2 rounded-[14px] px-3 text-[14px] font-semibold",
                                    selected
                                      ? "bg-[#F4F4F9] text-black dark:bg-[#2C2C2E] dark:text-white"
                                      : "text-[#868593]",
                                  )}
                                  style={
                                    {
                                      cornerShape: "squircle",
                                    } as React.CSSProperties
                                  }
                                >
                                  <span className="min-w-0 flex-1 truncate">
                                    <Highlight text={item.name} query={query} />
                                  </span>
                                  {!browsing && (
                                    <span className="shrink-0 text-[11px] font-medium text-[#A1A0AB] dark:text-[#6E6D78]">
                                      {CATEGORY_LABELS[item.category]}
                                    </span>
                                  )}
                                  {selected && (
                                    <span className="shrink-0 text-[#FC4C01]">
                                      <ArrowIcon />
                                    </span>
                                  )}
                                </div>
                              </Fragment>
                            );
                          })
                        )}
                      </div>

                      <div className="hidden w-[300px] shrink-0 p-1 sm:block">
                        {activeItem && (
                          <Preview key={activeItem.href} item={activeItem} />
                        )}
                      </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-4 px-3 pb-1 pt-2.5 text-[12px] font-medium text-[#868593] sm:flex">
                      <span className="flex items-center gap-1.5">
                        <Key>↑</Key>
                        <Key>↓</Key>
                        navigate
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Key>↵</Key>
                        open
                      </span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logos/Rareui.svg"
                          alt=""
                          className="size-3.5"
                        />
                        {results.length} of {components.length}
                      </span>
                    </div>
                  </div>
                </Squircle>
              </div>
            </Squircle>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
