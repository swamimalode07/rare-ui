"use client";

import { motion } from "motion/react";
import SidebarNav from "./SidebarNav";
import SidebarScroll from "./SidebarScroll";
import { ClosedIcon, OpenIcon } from "./icons";
import { Squircle } from "@squircle-js/react";
import CarbonAds from "../CarbonAds";

const PANEL_SHIFT = 400;

const Sidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-40 h-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        className="pointer-events-auto absolute left-4 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] bg-muted p-2 text-foreground shadow-2xs transition-colors hover:bg-muted/80"
      >
        {open ? <OpenIcon /> : <ClosedIcon />}
      </button>

      <Squircle asChild cornerRadius={23} cornerSmoothing={1}>
        <motion.div
          initial={false}
          animate={{ x: open ? 0 : -PANEL_SHIFT }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-auto flex h-full w-90 flex-col bg-background p-4 pl-6"
        >
          <h2 className="mt-18">Components</h2>
          <SidebarScroll className="mt-4 min-h-0 flex-1">
            <SidebarNav />
          </SidebarScroll>

          <CarbonAds className="mt-4 shrink-0" />
        </motion.div>
      </Squircle>
    </div>
  );
};

export default Sidebar;
