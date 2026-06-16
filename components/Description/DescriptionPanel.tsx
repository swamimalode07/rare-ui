"use client"

import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { activeComponent, installCommand } from "@/lib/components"
import CopyButton from "./CopyButton"
import { CodeXml, Maximize, Minimize } from "lucide-react"

// Panel is 1rem (16px) from the screen's right edge and 560px (w-140) wide, so
// +600px parks it fully past the right edge when closed — the mirror of the
// sidebar's left slide.
const PANEL_SHIFT = 600

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#7A7A7A" strokeWidth="2" />
    <path d="M12 11v5" stroke="#7A7A7A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="7.75" r="1.15" fill="#7A7A7A" />
  </svg>
)

const CollapseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="#7A7A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" stroke="#7A7A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type DescriptionPanelProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function DescriptionPanel({ open, setOpen }: DescriptionPanelProps) {
  const pathname = usePathname()
  const item = activeComponent(pathname)
  const command = item ? installCommand(item) : null

  return (
    <div className="absolute right-0 top-0 z-40 h-full">
      {/* Pinned cluster — mirrors the sidebar toggle on the opposite edge.
          Get-code sits to the right of the description toggle. */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-neutral-900 p-2 rounded-2xl shadow-sm shadow-black">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close description" : "Open description"}
          className="cursor-pointer rounded-full bg-neutral-800 p-1"
        >
          {open ? <Maximize className="w-5 h-5"/> : <Minimize className="w-5 h-5"/>}
        </button>

        {item?.source && (
          <a
            href={item.source}
            target="_blank"
            rel="noreferrer"
            aria-label="Get code"
            className="cursor-pointer rounded-full bg-neutral-800 p-1"
          >
            <CodeXml className="w-5 h-5"/>
          </a>
        )}
      </div>

      <motion.div
        initial={false}
        animate={{ x: open ? 0 : PANEL_SHIFT }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex h-full w-140 flex-col gap-4 rounded-2xl bg-black p-4 pl-6"
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
      </motion.div>
    </div>
  )
}
