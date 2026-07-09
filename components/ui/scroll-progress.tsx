"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react"

import { cn } from "@/lib/utils"

export type ScrollProgressSection = { id: string; label: string }

// Single smooth motion: the pill morphs its width while old/new labels crossfade
// through a soft blur, so the swap dissolves instead of re-rendering in stages.
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
// Width morphs with no bounce — a settle, not a snap.
const LAYOUT_TRANSITION = { duration: 0.5, ease: EASE_IN_OUT } as const
// Both labels animate at the same time; the blur hides the changeover.
const LABEL_CROSSFADE = { duration: 0.4, ease: EASE_IN_OUT } as const

export type ScrollProgressProps = React.ComponentProps<"div"> & {
  /** Ordered sections (ids must exist in the scrolled content) shown as the reader moves. */
  sections?: ScrollProgressSection[]
  /** Scroll container to track. Defaults to the window when omitted. */
  containerRef?: React.RefObject<HTMLElement | null>
}

const ScrollProgress = ({
  className,
  sections = [],
  containerRef,
  ...props
}: ScrollProgressProps) => {
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined
  )
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  })

  const [activeId, setActiveId] = React.useState(sections[0]?.id)

  React.useEffect(() => {
    const scroller = containerRef?.current ?? window

    const update = () => {
      const anchor = (containerRef?.current?.getBoundingClientRect().top ?? 0) + 120
      const active = sections.findLast(({ id }) => {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        return top !== undefined && top <= anchor
      })
      setActiveId(active?.id ?? sections[0]?.id)
    }

    update()
    scroller.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      scroller.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [sections, containerRef])

  const label = sections.find((s) => s.id === activeId)?.label
  const reduceMotion = useReducedMotion()

  // Measure the active label off-screen so we can animate the pill to its real
  // width. Animating the actual width (not a layout scale transform) keeps the
  // text crisp — no horizontal stretching during the morph.
  const measureRef = React.useRef<HTMLSpanElement>(null)
  const [labelWidth, setLabelWidth] = React.useState<number>()

  React.useLayoutEffect(() => {
    if (measureRef.current) {
      setLabelWidth(measureRef.current.offsetWidth)
    }
  }, [label])

  return (
    <div
      data-slot="scroll-progress"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 overflow-hidden rounded-full border border-border/60 bg-background/70 py-1.5 pl-2 pr-4 shadow-sm backdrop-blur">
        <div className="shrink-0">
          <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-90" aria-hidden>
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2.5"
              className="stroke-foreground/15"
            />
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="stroke-foreground"
              style={{ pathLength: progress }}
            />
          </svg>
        </div>

        {/* Morphs to the measured width; labels crossfade inside without scaling. */}
        <motion.div
          className="relative h-5 shrink-0"
          animate={{ width: labelWidth }}
          initial={false}
          transition={reduceMotion ? { duration: 0 } : LAYOUT_TRANSITION}
        >
          {/* Hidden sizer: always the current label, drives the width above. */}
          <span
            ref={measureRef}
            aria-hidden
            className="invisible absolute left-0 top-0 whitespace-nowrap text-sm font-medium leading-none"
          >
            {label}
          </span>

          <AnimatePresence initial={false}>
            {label && (
              <motion.span
                key={activeId}
                data-slot="scroll-progress-label"
                className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-sm font-medium leading-none text-foreground"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(4px)" }
                }
                transition={LABEL_CROSSFADE}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export { ScrollProgress }
export default ScrollProgress
