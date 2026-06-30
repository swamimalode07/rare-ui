"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

type Side = "left" | "right"
type SectionKind = "title" | "subtitle" | "section" | "body"
type SectionLevel = 1 | 2 | 3 | 4 | 5 | 6

export type ProximitySection = {
  id: string
  label: string
  kind?: SectionKind
  level?: SectionLevel
}

type DashPreset = {
  base: number
  bump: number
  thickness: number
  className: string
}

type DashProps = {
  active: boolean
  mouseY: MotionValue<number>
  onSelect: (id: string) => void
  registerDash: (id: string, node: HTMLButtonElement | null) => void
  section: ProximitySection
  sectionKind: SectionKind
  side: Side
}

type ProximitySidebarProps = {
  activeOffset?: number
  className?: string
  sections: ProximitySection[]
  side?: Side
}

const RADIUS = 40
const MAX_DASH_WIDTH = 110
const SCROLL_IDLE_RESET_DELAY = 80

const DASH_PRESETS: Record<SectionKind, DashPreset> = {
  title: {
    base: 40,
    bump: 70,
    thickness: 1,
    className: "bg-foreground",
  },
  subtitle: {
    base: 36,
    bump: 64,
    thickness: 1,
    className: "bg-foreground",
  },
  section: {
    base: 30,
    bump: 56,
    thickness: 1,
    className: "bg-muted-foreground/40",
  },
  body: {
    base: 24,
    bump: 50,
    thickness: 1,
    className: "bg-muted-foreground/40",
  },
}

const getSectionElement = (id: string) =>
  typeof document === "undefined" ? null : document.getElementById(id)

const getSectionKind = (section: ProximitySection): SectionKind => {
  if (section.kind) return section.kind
  if (section.level === 1) return "title"
  if (section.level === 2) return "subtitle"
  if (section.level === 3) return "section"
  return "body"
}

const getElementSectionKind = (id: string): SectionKind | undefined => {
  const heading = getSectionElement(id)?.querySelector("h1, h2, h3, h4, h5, h6")
  const tagName = heading?.tagName.toLowerCase()

  if (tagName === "h1") return "title"
  if (tagName === "h2") return "subtitle"
  if (tagName === "h3") return "section"
  if (tagName) return "body"
}

const getScrollParent = (element: HTMLElement) => {
  let parent = element.parentElement

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)

    if (/(auto|scroll|overlay)/.test(overflowY)) {
      return parent
    }

    parent = parent.parentElement
  }

  return window
}

const Dash = ({
  active,
  mouseY,
  onSelect,
  registerDash,
  section,
  sectionKind,
  side,
}: DashProps) => {
  const ref = useRef<HTMLButtonElement>(null)
  const preset = DASH_PRESETS[sectionKind]
  const activeWidth = preset.base + preset.bump

  useEffect(() => {
    registerDash(section.id, ref.current)
    return () => registerDash(section.id, null)
  }, [registerDash, section.id])

  const distance = useTransform(mouseY, (y) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return RADIUS
    return y - (rect.top + rect.height / 2)
  })

  const targetScaleX = useTransform(
    distance,
    [-RADIUS, 0, RADIUS],
    [
      preset.base / MAX_DASH_WIDTH,
      activeWidth / MAX_DASH_WIDTH,
      preset.base / MAX_DASH_WIDTH,
    ],
    { clamp: true }
  )

  const scaleX = useSpring(targetScaleX, {
    stiffness: 320,
    damping: 34,
    mass: 0.7,
  })

  return (
    <button
      ref={ref}
      type="button"
      aria-current={active ? "location" : undefined}
      aria-label={`Go to ${section.label}`}
      title={section.label}
      className="group flex h-px w-[110px] items-center border-0 bg-transparent p-0 outline-none"
      onClick={() => onSelect(section.id)}
    >
      <motion.span
        className={`block transition-colors duration-150 ease-out group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 ${preset.className}`}
        style={{
          height: preset.thickness,
          scaleX,
          transformOrigin: side === "left" ? "left center" : "right center",
          width: MAX_DASH_WIDTH,
        }}
      />
    </button>
  )
}

const ProximitySidebar = ({
  activeOffset = 0.4,
  className = "",
  side = "left",
  sections,
}: ProximitySidebarProps) => {
  const mouseY = useMotionValue(Infinity)
  const shouldReduceMotion = useReducedMotion()
  const dashRefs = useRef(new Map<string, HTMLButtonElement>())
  const pointerInside = useRef(false)
  const resetTimer = useRef<number | null>(null)
  const [activeId, setActiveId] = useState(sections[0]?.id)
  const [detectedKinds, setDetectedKinds] = useState<Record<string, SectionKind>>(
    {}
  )

  const sectionIds = useMemo(
    () => sections.map((section) => section.id).join("|"),
    [sections]
  )

  const registerDash = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) {
        dashRefs.current.set(id, node)
        return
      }

      dashRefs.current.delete(id)
    },
    []
  )

  const clearPendingReset = useCallback(() => {
    if (!resetTimer.current) return

    window.clearTimeout(resetTimer.current)
    resetTimer.current = null
  }, [])

  const setMouseToDash = useCallback(
    (id?: string) => {
      if (!id) {
        mouseY.set(Infinity)
        return
      }

      const node = dashRefs.current.get(id)
      if (!node) return

      const rect = node.getBoundingClientRect()
      mouseY.set(rect.top + rect.height / 2)
    },
    [mouseY]
  )

  const pulseDash = useCallback(
    (id?: string) => {
      setMouseToDash(id)
      clearPendingReset()

      if (!id || pointerInside.current) return

      resetTimer.current = window.setTimeout(() => {
        mouseY.set(Infinity)
        resetTimer.current = null
      }, SCROLL_IDLE_RESET_DELAY)
    },
    [clearPendingReset, mouseY, setMouseToDash]
  )

  const selectSection = useCallback(
    (id: string) => {
      const element = getSectionElement(id)
      if (!element) return

      element.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      })

      window.history.replaceState(null, "", `#${id}`)
      setActiveId(id)
      pulseDash(id)
    },
    [pulseDash, shouldReduceMotion]
  )

  useEffect(() => () => clearPendingReset(), [clearPendingReset])

  useEffect(() => {
    const kinds = sections.reduce<Record<string, SectionKind>>(
      (nextKinds, section) => {
        nextKinds[section.id] =
          section.kind || section.level
            ? getSectionKind(section)
            : getElementSectionKind(section.id) ?? getSectionKind(section)

        return nextKinds
      },
      {}
    )

    setDetectedKinds(kinds)
  }, [sectionIds, sections])

  useEffect(() => {
    if (!sections.length) return

    let frame = 0

    const updateActiveSection = () => {
      frame = 0

      const anchorY = window.innerHeight * activeOffset
      let nextActiveId = sections[0]?.id
      let shortestDistance = Number.POSITIVE_INFINITY

      for (const section of sections) {
        const element = getSectionElement(section.id)
        if (!element) continue

        const rect = element.getBoundingClientRect()
        const containsAnchor = rect.top <= anchorY && rect.bottom >= anchorY
        const distance = containsAnchor
          ? 0
          : Math.min(Math.abs(rect.top - anchorY), Math.abs(rect.bottom - anchorY))

        if (distance < shortestDistance) {
          shortestDistance = distance
          nextActiveId = section.id
        }
      }

      setActiveId(nextActiveId)

      if (!pointerInside.current) {
        pulseDash(nextActiveId)
      }
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveSection)
    }

    const scrollParents = new Set<EventTarget>([window])

    for (const section of sections) {
      const element = getSectionElement(section.id)
      if (element) scrollParents.add(getScrollParent(element))
    }

    updateActiveSection()

    for (const parent of scrollParents) {
      parent.addEventListener("scroll", scheduleUpdate, { passive: true })
    }

    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)

      for (const parent of scrollParents) {
        parent.removeEventListener("scroll", scheduleUpdate)
      }

      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [activeOffset, pulseDash, sectionIds, sections])

  return (
    <nav
      aria-label="Page sections"
      className={`flex h-full min-h-0 items-center ${
        side === "left" ? "justify-start" : "justify-end"
      } ${className}`}
    >
      <div
        className={`new-home_minimap__dDggR mx-8 flex flex-col ${
          side === "right" ? "items-end" : "items-start"
        }`}
        style={{ gap: 8 }}
        onPointerMove={(event) => {
          clearPendingReset()
          pointerInside.current = true
          mouseY.set(event.clientY)
        }}
        onPointerLeave={() => {
          pointerInside.current = false
          mouseY.set(Infinity)
        }}
      >
        {sections.map((section) => (
          <Dash
            key={section.id}
            active={section.id === activeId}
            mouseY={mouseY}
            onSelect={selectSection}
            registerDash={registerDash}
            section={section}
            sectionKind={detectedKinds[section.id] ?? getSectionKind(section)}
            side={side}
          />
        ))}
      </div>
    </nav>
  )
}

export default ProximitySidebar
