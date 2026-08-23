"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ChevronsUpDown, X } from "lucide-react";
import {
  installCommand,
  PACKAGE_MANAGERS,
  type ComponentItem,
  type PackageManager,
} from "@/lib/components";
import { cn } from "@/lib/utils";
import CopyButton from "../CopyButton";

const EASE = [0.22, 1, 0.36, 1] as const;

// closing reads as one gesture: the text blurs away first, then the bar folds shut behind it
const barVariants: Variants = {
  hidden: {
    width: 0,
    transition: { width: { duration: 0.26, ease: EASE, delay: 0.11 } },
  },
  shown: {
    width: "auto",
    transition: { width: { duration: 0.3, ease: EASE }, delayChildren: 0.06 },
  },
};

const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.13, ease: "easeIn" },
  },
  shown: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.24, ease: "easeOut" },
  },
};

export default function InstallBar({ item }: { item: ComponentItem }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pm, setPm] = useState<PackageManager>("npm");
  // the width animation needs overflow-hidden, which would clip the pm menu, so it lifts once settled
  const [clip, setClip] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (ref.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menuOpen) {
        setMenuOpen(false);
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, menuOpen]);

  const command = installCommand(item, pm);
  if (!command) return null;

  const suffix = `/${item.registry}`;
  const prefix = command.slice(0, -suffix.length);

  const instant = { duration: 0 };

  // opening: Install leaves, then the cross lands. closing: the cross blurs off, the bar
  // folds shut, and only then does Install come back, so the three read as one sequence.
  const installTransition = reduceMotion
    ? instant
    : open
      ? { duration: 0.12, ease: "easeIn" as const }
      : { duration: 0.16, delay: 0.14, ease: "easeOut" as const };

  const crossTransition = reduceMotion
    ? instant
    : open
      ? { duration: 0.16, delay: 0.06, ease: "easeOut" as const }
      : { duration: 0.1, ease: "easeIn" as const };

  const toggle = () => {
    setMenuOpen(false);
    setOpen((v) => !v);
  };

  return (
    <div
      ref={ref}
      className="flex items-center rounded-l-2xl border-apple bg-muted p-2 shadow-sm"
    >
      <motion.button
        layout={reduceMotion ? false : "size"}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close install command" : "Show install command"}
        transition={{
          layout: { duration: 0.24, ease: EASE, delay: open ? 0 : 0.1 },
        }}
        className="flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-popover px-2.5 text-xs font-medium"
      >
        {/* an invisible copy of the active label sizes the pill, so layout can animate the width while both labels crossfade in place */}
        <span aria-hidden className="grid place-items-center">
          <span className="invisible col-start-1 row-start-1">
            {open ? <X className="size-3.5" /> : "Install"}
          </span>
          <motion.span
            className="col-start-1 row-start-1"
            animate={{
              opacity: open ? 0 : 1,
              filter: open ? "blur(2.5px)" : "blur(0px)",
            }}
            transition={installTransition}
          >
            Install
          </motion.span>
          <motion.span
            className="col-start-1 row-start-1 text-white"
            animate={{
              opacity: open ? 1 : 0,
              filter: open ? "blur(0px)" : "blur(2.5px)",
            }}
            transition={crossTransition}
          >
            <X className="size-3.5" />
          </motion.span>
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            variants={barVariants}
            initial="hidden"
            animate="shown"
            exit="hidden"
            onAnimationStart={() => setClip(true)}
            onAnimationComplete={() => setClip(false)}
            className={clip ? "overflow-hidden" : "overflow-visible"}
          >
            <motion.div
              variants={reduceMotion ? undefined : contentVariants}
              className="flex w-max items-center gap-3 whitespace-nowrap pl-2 pr-1"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-label="Change package manager"
                  className="flex h-7 cursor-pointer items-center gap-1.5 rounded-[10px] bg-popover px-2.5 text-xs font-medium"
                >
                  {pm}
                  <ChevronsUpDown className="size-3 opacity-45" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute left-0 top-full z-50 mt-1.5 rounded-lg bg-popover p-1 shadow-lg"
                    >
                      {PACKAGE_MANAGERS.map((manager) => (
                        <li key={manager}>
                          <button
                            type="button"
                            onClick={() => {
                              setPm(manager);
                              setMenuOpen(false);
                            }}
                            className={cn(
                              "w-full cursor-pointer rounded-md px-2.5 py-1 text-left text-xs font-medium transition-colors",
                              pm === manager
                                ? "text-foreground"
                                : "text-foreground/40 hover:text-foreground/70",
                            )}
                          >
                            {manager}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <span aria-hidden className="h-4 w-px bg-foreground/12" />

              <code className="max-w-[34vw] truncate font-mono text-xs tracking-tight text-foreground/45">
                {prefix}
                <span className="font-semibold text-foreground">{suffix}</span>
              </code>

              <CopyButton value={command} label="Copy command" title="" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
