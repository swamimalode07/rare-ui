"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimate } from "motion/react"
import { cn } from "@/lib/utils"

const components = [
  { id: 0, name: "Folder component" },
  { id: 1, name: "Button component" },
  { id: 2, name: "Input component" },
  { id: 3, name: "Select component" },
  { id: 4, name: "Checkbox component" },
  { id: 5, name: "Radio component" },
  { id: 6, name: "Switch component" },
  { id: 7, name: "Textarea component" },
  { id: 8, name: "Tooltip component" },
  { id: 9, name: "Popover component" },
  { id: 10, name: "Menu component" },
  { id: 11, name: "Dialog component" },
  { id: 12, name: "Tooltip component" },
  { id: 13, name: "Popover component" },
  { id: 14, name: "Menu component" },
  { id: 15, name: "Dialog component" },
  { id: 16, name: "Tooltip component" },
]

const SidebarList = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dot, animate] = useAnimate<HTMLSpanElement>()
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const prevY = useRef<number | null>(null)

  useEffect(() => {
    const el = itemRefs.current[activeIndex]
    if (!el || !dot.current) return

    const toY = el.offsetTop + el.offsetHeight / 2 - 3 // center dot on the item

    // First placement: snap into position, no hop.
    if (prevY.current === null) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 })
      prevY.current = toY
      return
    }

    const fromY = prevY.current
    const delta = toY - fromY
    prevY.current = toY
    if (delta === 0) return

    const radius = Math.min(Math.abs(delta) / 2, 8) // how far it bows left
    const steps = 20
    const x: number[] = []
    const y: number[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      y.push(fromY + (delta * (1 - Math.cos(Math.PI * t))) / 2) // eased slide
      x.push(-radius * Math.sin(Math.PI * t)) // out to the left and back
    }

    animate(dot.current, { x, y }, { duration: 0.25, ease: "easeOut" })
  }, [activeIndex, animate, dot])

  return (
    <ul className="relative flex flex-col gap-1 pl-6">
      <span
        ref={dot}
        aria-hidden
        className="absolute left-2 top-0 h-1.5 w-1.5 rounded-full bg-[#FC4C01]"
      />

      {components.map((component, i) => {
        const isActive = i === activeIndex

        return (
          <li
            key={component.id}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
          >
            <motion.button
              type="button"
              onClick={() => setActiveIndex(i)}
              whileHover={{ x: 16}}

              transition={{ duration: 0.2 }}
              className={cn(
                "flex w-full items-center rounded-lg p-1 text-left text-sm transition-all duration-200",
                isActive
                  ? "text-foreground"
                  : "text-foreground/55",
              )}
            >
              {component.name}
            </motion.button>
          </li>
        )
      })}
    </ul>
  )
}

export default SidebarList
