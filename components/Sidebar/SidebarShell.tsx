"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Sidebar from "./Sidebar"
import { DescriptionPanel } from "../Description/DescriptionPanel"

// Content offset for each panel: its width + 1rem gap. Drops to 0 when the
// panel slides away, so the content card expands to fill the freed space.
const NAV_SPACE = 316 // 300px (w-75) sidebar + gap
const INFO_SPACE = 576 // 560px (w-140) description panel + gap

// Owns both panels' open state so the content card can reflow in sync with
// either side's slide animation.
export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(true)
  const [infoOpen, setInfoOpen] = useState(true)

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
        <div className="relative z-0 h-full rounded-2xl bg-[#121212] p-4">{children}</div>
      </motion.div>
    </div>
  )
}
