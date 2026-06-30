"use client"

import React, { useRef } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"


const TICKS_PER_MARKER = [6, 5, 6, 5, 6]

const BASE = 24
const MARKER_BASE = 40

const TICK_BUMP = 50
const MARKER_BUMP = 70

const RADIUS = 40

type Side = "left" | "right"

type LineProps = {
  marker?: boolean
  mouseY: MotionValue<number>
  side: Side
}

const Line = ({ marker = false, mouseY, side }: LineProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const base = marker ? MARKER_BASE : BASE
  const bump = marker ? MARKER_BUMP : TICK_BUMP

  const distance = useTransform(mouseY, (y) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return RADIUS
    return y - (rect.top + rect.height / 2)
  })

  const targetWidth = useTransform(
    distance,
    [-RADIUS, 0, RADIUS],
    [base, base + bump, base],
    { clamp: true }
  )

  const width = useSpring(targetWidth, {
    stiffness: 300,
    damping: 30,
  })

  return (
    <motion.div
      ref={ref}
      className={marker ? "bg-foreground" : "bg-muted-foreground/40"}
      style={{
        width,
        height: 1,
        transformOrigin: side === "left" ? "0 0" : "100% 0",
      }}
    />
  )
}

type ProximitySidebarProps = {
  side?: Side
  sections: React.RefObject<HTMLElement>[]
}

const ProximitySidebar = ({
  side = "left",
}: ProximitySidebarProps) => {
  const mouseY = useMotionValue(Infinity)

  return (
    <div
      className={`flex min-h-screen items-center ${
        side === "left" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        aria-hidden="true"
        className={`new-home_minimap__dDggR mx-8 flex flex-col ${
          side === "right" ? "items-end" : "items-start"
        }`}
        style={{ gap: 8 }}
        onMouseMove={(e) => mouseY.set(e.clientY)}
        onMouseLeave={() => mouseY.set(Infinity)}
      >
        {TICKS_PER_MARKER.map((tickCount, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <Line marker mouseY={mouseY} side={side} />
            {Array.from({ length: tickCount }, (_, i) => (
              <Line key={i} mouseY={mouseY} side={side} />
            ))}
          </React.Fragment>
        ))}

        <Line marker mouseY={mouseY} side={side} />
      </div>
    </div>
  )
}

export default ProximitySidebar