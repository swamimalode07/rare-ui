"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Sidebar from "./Sidebar";
import { DescriptionPanel } from "../Description/DescriptionPanel";

const NAV_SPACE = 368;
const INFO_SPACE = 576;

export default function DesktopShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  // ?record hides the floating controls so a demo can be screen recorded clean
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("record")) return;
    document.documentElement.dataset.record = "";
    return () => {
      delete document.documentElement.dataset.record;
    };
  }, []);

  return (
    <div className="relative h-full">
      <Sidebar open={navOpen} setOpen={setNavOpen} />
      <DescriptionPanel open={infoOpen} setOpen={setInfoOpen} />

      <motion.div
        initial={false}
        animate={{
          paddingLeft: navOpen ? NAV_SPACE : 0,
          paddingRight: infoOpen ? INFO_SPACE : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full"
      >
        <div
          className="relative z-0 h-full rounded-[45px] bg-card p-4"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
