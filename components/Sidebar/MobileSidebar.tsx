"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SidebarList from "./SidebarList";
import { ClosedIcon, OpenIcon } from "./icons";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        className="absolute left-4 top-4 z-60 cursor-pointer rounded-lg bg-popover p-2"
      >
        {open ? <OpenIcon /> : <ClosedIcon />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 touch-none bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto rounded-r-3xl bg-card p-4 pl-6"
            >
              <h2 className="mt-18">Components</h2>
              <div className="mt-4">
                <SidebarList onNavigate={() => setOpen(false)} showDot={false} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
