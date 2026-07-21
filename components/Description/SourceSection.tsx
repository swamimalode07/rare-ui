"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import PanelCode from "./PanelCode";
import { fetchSource, SOURCE_LOADING } from "./fetchSource";

export default function SourceSection({ registry }: { registry: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next || code) return;
    setCode(SOURCE_LOADING);
    setCode(await fetchSource(registry));
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-medium">
          {open ? "Hide source" : "View source"}
        </span>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="text-foreground/60"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <PanelCode
              code={code ?? SOURCE_LOADING}
              showLineNumbers
              className="mt-4 max-h-[70svh]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
