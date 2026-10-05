"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CodeXml, Maximize, Minimize, X } from "lucide-react";
import { activeComponent } from "@/lib/components";
import CodeDrawer from "./CodeDrawer";
import DescriptionContent from "./DescriptionContent";
import InstallBar from "./InstallBar";
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
      <div className="pointer-events-auto absolute right-4 top-4 z-50 flex items-center gap-1.5 rounded-[16px] bg-muted/90 p-1.5 shadow-2xs backdrop-blur-md">
        {item?.registry && <InstallBar key={item.href} item={item} />}

        <Tooltip label={open ? "Close description" : "Open description"}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close description" : "Open description"}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[12px] bg-popover text-foreground shadow-2xs transition-colors hover:bg-popover/80"
          >
            {open ? (
              <Maximize className="h-3.5 w-3.5" />
            ) : (
              <Minimize className="h-3.5 w-3.5" />
            )}
          </button>
        </Tooltip>

        {item?.registry && (
          <Tooltip label={codeOpen ? "Hide code" : "Get code"}>
            <button
              type="button"
              onClick={toggleCode}
              aria-label={codeOpen ? "Hide code" : "Get code"}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[12px] bg-popover text-foreground shadow-2xs transition-colors hover:bg-popover/80"
            >
              {codeOpen ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <CodeXml className="h-3.5 w-3.5" />
              )}
            </button>
          </Tooltip>
        )}

        <Tooltip label="Toggle theme" align="end">
          <ThemeToggle className="flex h-7 w-7 items-center justify-center rounded-[12px] bg-popover p-0 text-foreground shadow-2xs transition-colors hover:bg-popover/80 [&_svg]:h-3.5 [&_svg]:w-3.5" />
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
