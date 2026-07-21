"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CodeXml, Maximize, Minimize } from "lucide-react";
import { activeComponent } from "@/lib/components";
import CodeDrawer from "./CodeDrawer";
import DescriptionContent from "./DescriptionContent";
import ThemeToggle from "../ThemeToggle";
import Tooltip from "../Tooltip";

const PANEL_SHIFT = 600;

type DescriptionPanelProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function DescriptionPanel({ open, setOpen }: DescriptionPanelProps) {
  const pathname = usePathname();
  const item = activeComponent(pathname);

  const [codeOpen, setCodeOpen] = useState(false);
  useEffect(() => {
    if (!open) setCodeOpen(false);
  }, [open]);

  const toggleCode = () => {
    if (codeOpen) {
      setCodeOpen(false);
    } else {
      setOpen(true);
      setCodeOpen(true);
    }
  };

  return (
    <div className="pointer-events-none absolute right-0 top-0 z-40 h-full">
      <div className="pointer-events-auto absolute top-4 right-4 z-50 flex items-center gap-2 rounded-2xl border-apple bg-muted p-2 shadow-sm">
        <Tooltip label={open ? "Close description" : "Open description"}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close description" : "Open description"}
            className="cursor-pointer rounded-full bg-popover p-1"
          >
            {open ? (
              <Maximize className="h-5 w-5" />
            ) : (
              <Minimize className="h-5 w-5" />
            )}
          </button>
        </Tooltip>

        {item?.registry && (
          <Tooltip label={codeOpen ? "Hide code" : "Get code"}>
            <button
              type="button"
              onClick={toggleCode}
              aria-label={codeOpen ? "Hide code" : "Get code"}
              className="cursor-pointer rounded-full bg-popover p-1"
            >
              <CodeXml className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip label="Toggle theme" align="end">
          <ThemeToggle className="rounded-full p-1 bg-popover" />
        </Tooltip>
      </div>

      <motion.div
        initial={false}
        animate={{ x: open ? 0 : PANEL_SHIFT }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="pointer-events-auto relative flex h-full w-140 flex-col overflow-hidden rounded-2xl bg-background"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background to-transparent" />

        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
          <DescriptionContent item={item} className="p-8 pt-60" />
        </div>

        <CodeDrawer
          open={codeOpen}
          onClose={() => setCodeOpen(false)}
          item={item}
        />
      </motion.div>
    </div>
  );
}
