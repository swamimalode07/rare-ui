"use client"

import { useState } from "react"
import { motion } from "motion/react"
import SidebarList from "./SidebarList"

// w-80 (320px) + left m-4 (16px): how far to slide so the panel clears the edge.
const PANEL_SHIFT = 336

const OpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
        <path
            d="m20,3H4c-1.654,0-3,1.346-3,3v12c0,1.654,1.346,3,3,3h16c1.654,0,3-1.346,3-3V6c0-1.654-1.346-3-3-3ZM3,18V6c0-.551.449-1,1-1h11v14H4c-.551,0-1-.449-1-1Z"
            strokeWidth="0"
            fill="#7A7A7A"
        />
    </svg>
)

const ClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
        <line x1="15" y1="4" x2="15" y2="20" fill="none" stroke="#7A7A7A" strokeMiterlimit="10" strokeWidth="2" />
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" transform="translate(24) rotate(90)" fill="none" stroke="#7A7A7A" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2" />
    </svg>
)

const Sidebar = () => {
    const [open, setOpen] = useState(true)

    return (
        <div className="relative">
            {/* Pinned at the panel's icon spot (m-4 + p-4 = 32px). Never moves — only
          the icon inside swaps when the panel slides away. */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close sidebar" : "Open sidebar"}
                className="absolute top-4 left-8 z-10 cursor-pointer bg-neutral-800 rounded-lg p-2"
            >
                {open ? <OpenIcon /> : <ClosedIcon />}
            </button>

            <motion.div
                animate={{ x: open ? 0 : -PANEL_SHIFT }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-neutral-900 w-75 h-[calc(100vh-2rem)] m-4 p-4 rounded-2xl"
            >
                <h2 className="mt-18">Components</h2>
                <div className="mt-4">
                    <SidebarList />
                </div>
            </motion.div>
        </div>
    )
}

export default Sidebar
