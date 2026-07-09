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

// iOS-style motion: the pill morphs into a squircle panel with a soft settle,
// content crossfades through a light blur so nothing looks like it re-renders.
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
const EASE_OUT = [0.22, 1, 0.36, 1] as const
// Width/height/radius morph — a small settle, no hard snap.
const SIZE_SPRING = { type: "spring", bounce: 0.16, duration: 0.5 } as const
// Both labels crossfade together — quick and clean so it reads as a swap, not a smear.
const LABEL_CROSSFADE = { duration: 0.22, ease: EASE_OUT } as const
// Collapsed <-> open layers dissolve into each other.
const LAYER_FADE = { duration: 0.24, ease: EASE_IN_OUT } as const

// useLayoutEffect on the client, useEffect on the server (avoids SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

type Size = { width: number; height: number }

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
  const [open, setOpen] = React.useState(false)
  const reduceMotion = useReducedMotion()

  // While a click-to-scroll is in flight, pin the active section to the choice so
  // the scrollspy doesn't fight it as the smooth scroll passes through sections.
  const scrollLock = React.useRef(false)
  const scrollLockTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    const scroller = containerRef?.current ?? window

    const update = () => {
      if (scrollLock.current) return
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

  // Measure both states off-screen so the container animates to real pixel sizes.
  // Animating actual width/height (not a layout-scale transform) keeps text crisp.
  const collapsedRef = React.useRef<HTMLDivElement>(null)
  const openRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const [collapsedSize, setCollapsedSize] = React.useState<Size>()
  const [openSize, setOpenSize] = React.useState<Size>()
  const [labelWidth, setLabelWidth] = React.useState<number>()

  useIsoLayoutEffect(() => {
    if (labelRef.current) setLabelWidth(labelRef.current.offsetWidth)
    if (collapsedRef.current) {
      setCollapsedSize({
        width: collapsedRef.current.offsetWidth,
        height: collapsedRef.current.offsetHeight,
      })
    }
    if (openRef.current) {
      setOpenSize({
        width: openRef.current.offsetWidth,
        height: openRef.current.offsetHeight,
      })
    }
  }, [label, sections])

  // Close on outside click / Escape while open.
  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const selectSection = (id: string) => {
    // Pin to the chosen section and let the scrollspy resume once scrolling settles.
    scrollLock.current = true
    clearTimeout(scrollLockTimer.current)
    scrollLockTimer.current = setTimeout(() => {
      scrollLock.current = false
    }, reduceMotion ? 0 : 700)

    setActiveId(id)
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    })
  }

  React.useEffect(() => () => clearTimeout(scrollLockTimer.current), [])

  const size = open ? openSize : collapsedSize
  const radius = open ? 26 : (collapsedSize?.height ?? 32) / 2

  const squircle = "[corner-shape:squircle]"

  return (
    <div
      ref={rootRef}
      data-slot="scroll-progress"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        className
      )}
      {...props}
    >
      {/* Hidden sizers — measured, never shown. */}
      <div className="pointer-events-none invisible absolute" aria-hidden>
        <div
          ref={collapsedRef}
          className="inline-flex items-center gap-2.5 py-1.5 pl-2 pr-4"
        >
          <span className="h-5 w-5" />
          <span
            ref={labelRef}
            className="whitespace-nowrap text-sm font-medium leading-none"
          >
            {label}
          </span>
        </div>
        <div ref={openRef} className="w-max p-1.5">
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium leading-none"
            >
              <span className="h-1.5 w-1.5" />
              <span className="whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The morphing squircle, anchored at the bottom so it grows upward. */}
      {size && (
        <motion.div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden border border-border/60 bg-background/70 shadow-lg backdrop-blur-md",
            squircle
          )}
          initial={false}
          animate={{
            width: size.width,
            height: size.height,
            borderRadius: radius,
          }}
          transition={reduceMotion ? { duration: 0 } : SIZE_SPRING}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {open ? (
              <motion.ul
                key="list"
                className="absolute inset-0 flex flex-col p-1.5"
                initial={{ opacity: 0, filter: reduceMotion ? undefined : "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: reduceMotion ? undefined : "blur(4px)" }}
                transition={LAYER_FADE}
              >
                {sections.map((s, i) => {
                  const isActive = s.id === activeId
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => selectSection(s.id)}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-sm font-medium leading-none transition-colors",
                          squircle,
                          isActive
                            ? "text-foreground"
                            : "text-foreground/55 hover:text-foreground/80"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="scroll-progress-active"
                            className={cn(
                              "absolute inset-0 rounded-[14px] bg-foreground/10",
                              squircle
                            )}
                            transition={reduceMotion ? { duration: 0 } : SIZE_SPRING}
                          />
                        )}
                        <motion.span
                          className={cn(
                            "relative h-1.5 w-1.5 shrink-0 rounded-full",
                            isActive ? "bg-foreground" : "bg-foreground/30"
                          )}
                          initial={
                            reduceMotion
                              ? undefined
                              : { opacity: 0, y: 4, filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{
                            duration: 0.3,
                            ease: EASE_IN_OUT,
                            delay: reduceMotion ? 0 : 0.04 + i * 0.03,
                          }}
                        />
                        <motion.span
                          className="relative whitespace-nowrap"
                          initial={
                            reduceMotion
                              ? undefined
                              : { opacity: 0, y: 4, filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{
                            duration: 0.3,
                            ease: EASE_IN_OUT,
                            delay: reduceMotion ? 0 : 0.04 + i * 0.03,
                          }}
                        >
                          {s.label}
                        </motion.span>
                      </button>
                    </li>
                  )
                })}
              </motion.ul>
            ) : (
              <motion.button
                key="pill"
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Show sections"
                className="absolute inset-0 flex items-center gap-2.5 py-1.5 pl-2 pr-4"
                initial={{ opacity: 0, filter: reduceMotion ? undefined : "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: reduceMotion ? undefined : "blur(4px)" }}
                transition={LAYER_FADE}
              >
                <span className="shrink-0">
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
                </span>

                {/* Label crossfade — text dissolves as sections change. */}
                <span
                  className="relative h-5 shrink-0"
                  style={{ width: labelWidth }}
                >
                  <AnimatePresence initial={false}>
                    {label && (
                      <motion.span
                        key={activeId}
                        data-slot="scroll-progress-label"
                        className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-sm font-medium leading-none text-foreground"
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, filter: "blur(1.5px)" }
                        }
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, filter: "blur(1.5px)" }
                        }
                        transition={LABEL_CROSSFADE}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export { ScrollProgress }
export default ScrollProgress
