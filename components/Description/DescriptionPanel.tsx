"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { CodeXml, Maximize, Minimize } from "lucide-react"
import { activeComponent, installCommand } from "@/lib/components"
import CopyButton from "./CopyButton"
import CodeDrawer from "./CodeDrawer"

// Panel is 1rem (16px) from the screen's right edge and 560px (w-140) wide, so
// +600px parks it fully past the right edge when closed — the mirror of the
// sidebar's left slide.
const PANEL_SHIFT = 600

type DescriptionPanelProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function DescriptionPanel({ open, setOpen }: DescriptionPanelProps) {
  const pathname = usePathname()
  const item = activeComponent(pathname)
  const command = item ? installCommand(item) : null

  // The code drawer slides up over the panel; closing the panel closes it too.
  const [codeOpen, setCodeOpen] = useState(false)
  useEffect(() => {
    if (!open) setCodeOpen(false)
  }, [open])

  const toggleCode = () => {
    if (codeOpen) {
      setCodeOpen(false)
    } else {
      setOpen(true)
      setCodeOpen(true)
    }
  }

  return (
    <div className="absolute right-0 top-0 z-40 h-full">
      {/* Pinned cluster — mirrors the sidebar toggle on the opposite edge.
          Get-code sits to the right of the description toggle. */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-neutral-900 p-2 shadow-sm shadow-black">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close description" : "Open description"}
          className="cursor-pointer rounded-full bg-neutral-800 p-1"
        >
          {open ? <Maximize className="h-5 w-5" /> : <Minimize className="h-5 w-5" />}
        </button>

        {item?.registry && (
          <button
            type="button"
            onClick={toggleCode}
            aria-label={codeOpen ? "Hide code" : "Get code"}
            className="cursor-pointer rounded-full bg-neutral-800 p-1"
          >
            <CodeXml className="h-5 w-5" />
          </button>
        )}
      </div>

      <motion.div
        initial={false}
        animate={{ x: open ? 0 : PANEL_SHIFT }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex h-full w-140 flex-col gap-4 overflow-hidden rounded-2xl bg-black p-4 pl-6"
      >
        <div className="mt-18">
          <h2 className="text-lg font-semibold">{item?.name ?? "Component"}</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/55">
            {item?.description ?? "This component is not available yet."}
          </p>
        </div>

        {command && (
          <div className="mt-auto">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/40">
              Installation
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-800 p-2 pl-3">
              <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-foreground/80">
                {command}
              </code>
              <CopyButton value={command} />
            </div>
          </div>
        )}

        <CodeDrawer open={codeOpen} onClose={() => setCodeOpen(false)} item={item} />
      </motion.div>
    </div>
  )
}
