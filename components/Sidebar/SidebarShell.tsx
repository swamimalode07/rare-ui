"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Sidebar from "./Sidebar";
import { DescriptionPanel } from "../Description/DescriptionPanel";
import { PreviewControlsProvider } from "../preview/PreviewControls";
import { Squircle } from "@squircle-js/react";


const NAV_SPACE = 316;
const INFO_SPACE = 576;

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <PreviewControlsProvider>
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
          <Squircle
            cornerRadius={23}
            cornerSmoothing={1}
            className="relative z-0 h-full bg-card p-4">
            {children}
          </Squircle>
        </motion.div>
      </div>
    </PreviewControlsProvider>
  );
}
