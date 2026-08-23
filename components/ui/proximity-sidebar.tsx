"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MutableRefObject,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { animate } from "motion";

import { cn } from "@/lib/utils";

type Side = "left" | "right";
type SectionKind = "title" | "subtitle" | "section" | "body";
type SectionLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ProximityHoverCue = "none" | "dim" | "solid";

export type ProximitySection = {
  id: string;
  label: string;
  kind?: SectionKind;
  level?: SectionLevel;
};

type DashPreset = {
  base: number;
  bump: number;
  className: string;
  hoverClassName: string;
};

type DashTone = "future" | "trail" | "tip";

type DashProps = {
  active: boolean;
  aiming: boolean;
  centersRef: MutableRefObject<Map<string, number>>;
  fillOpacity?: number;
  hoverCue: ProximityHoverCue;
  hovered: boolean;
  mouseY: MotionValue<number>;
  onSelect: (id: string) => void;
  preset: DashPreset;
  reduceMotion: boolean;
  registerDash: (id: string, node: HTMLButtonElement | null) => void;
  section: ProximitySection;
  side: Side;
  tone: DashTone;
};

type ProximitySidebarProps = Omit<ComponentProps<"nav">, "children"> & {
  activeOffset?: number;
  fillOpacity?: number;
  hoverCue?: ProximityHoverCue;
  sections: ProximitySection[];
  side?: Side;
};

const RADIUS = 40;
const MAX_DASH_WIDTH = 110;
const SCROLL_IDLE_RESET_DELAY = 80;
const SCROLL_LOCK_IDLE = 120;
const BOTTOM_SNAP = 8;
const EMPHASIS_SCALE_Y = 2;
const FILL_CLASS = "bg-foreground/69 dark:bg-foreground/55";
const FILL_HOVER_CLASS = "bg-foreground dark:bg-foreground/55";
const TITLE_CLASS = "bg-foreground/25 dark:bg-foreground/30";
const TITLE_HOVER_CLASS = "bg-foreground dark:bg-foreground/30";
const BODY_CLASS = "bg-muted-foreground/30 dark:bg-muted-foreground/40";
const BODY_HOVER_CLASS = "bg-foreground dark:bg-muted-foreground/40";
const DASH_HEIGHT_CLASS = "h-[1.5px] dark:h-px";
const DASH_SPRING = { stiffness: 320, damping: 34, mass: 0.7 };
const FILL_SPRING = { type: "spring", duration: 0.28, bounce: 0 } as const;
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const DASH_PRESETS: Record<SectionKind, DashPreset> = {
  title: {
    base: 40,
    bump: 70,
    className: TITLE_CLASS,
    hoverClassName: TITLE_HOVER_CLASS,
  },
  subtitle: {
    base: 36,
    bump: 64,
    className: TITLE_CLASS,
    hoverClassName: TITLE_HOVER_CLASS,
  },
  section: {
    base: 30,
    bump: 56,
    className: BODY_CLASS,
    hoverClassName: BODY_HOVER_CLASS,
  },
  body: {
    base: 24,
    bump: 50,
    className: BODY_CLASS,
    hoverClassName: BODY_HOVER_CLASS,
  },
};

const getSectionElement = (id: string) =>
  typeof document === "undefined" ? null : document.getElementById(id);

const getSectionKind = (section: ProximitySection): SectionKind => {
  if (section.kind) return section.kind;
  if (section.level === 1) return "title";
  if (section.level === 2) return "subtitle";
  if (section.level === 3) return "section";
  return "body";
};

const getElementSectionKind = (id: string): SectionKind | undefined => {
  const heading = getSectionElement(id)?.querySelector(
    "h1, h2, h3, h4, h5, h6",
  );
  const tagName = heading?.tagName.toLowerCase();

  if (tagName === "h1") return "title";
  if (tagName === "h2") return "subtitle";
  if (tagName === "h3") return "section";
  if (tagName) return "body";
};

const resolveSectionKinds = (
  sections: ProximitySection[],
  detectFromDom: boolean,
) =>
  sections.reduce<Record<string, SectionKind>>((nextKinds, section) => {
    nextKinds[section.id] =
      !detectFromDom || section.kind || section.level
        ? getSectionKind(section)
        : (getElementSectionKind(section.id) ?? getSectionKind(section));

    return nextKinds;
  }, {});

const kindsMatch = (
  current: Record<string, SectionKind>,
  next: Record<string, SectionKind>,
) => {
  const ids = Object.keys(next);
  return (
    ids.length === Object.keys(current).length &&
    ids.every((id) => current[id] === next[id])
  );
};

const getScrollParent = (element: HTMLElement) => {
  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(overflowY)) return parent;
    parent = parent.parentElement;
  }

  return window;
};

const isScrolledToEnd = (scroller: HTMLElement | Window) => {
  if (scroller instanceof HTMLElement) {
    return (
      scroller.scrollTop + scroller.clientHeight >=
      scroller.scrollHeight - BOTTOM_SNAP
    );
  }

  return (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - BOTTOM_SNAP
  );
};

const getDashTone = (index: number, activeIndex: number): DashTone => {
  if (activeIndex < 0) return "future";
  if (index === activeIndex) return "tip";
  if (index < activeIndex) return "trail";
  return "future";
};

const captureCenter = (node: HTMLButtonElement) => {
  const rect = node.getBoundingClientRect();
  return rect.top + rect.height / 2;
};

const Dash = ({
  active,
  aiming,
  centersRef,
  fillOpacity,
  hoverCue,
  hovered,
  mouseY,
  onSelect,
  preset,
  reduceMotion,
  registerDash,
  section,
  side,
  tone,
}: DashProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const activeWidth = preset.base + preset.bump;
  const restScaleX = preset.base / MAX_DASH_WIDTH;

  useEffect(() => {
    registerDash(section.id, ref.current);
    return () => registerDash(section.id, null);
  }, [registerDash, section.id]);

  const distance = useTransform(mouseY, (y) => {
    const center = centersRef.current.get(section.id);
    if (center == null) return RADIUS;
    return y - center;
  });

  const targetScaleX = useTransform(
    distance,
    [-RADIUS, 0, RADIUS],
    [restScaleX, activeWidth / MAX_DASH_WIDTH, restScaleX],
    { clamp: true },
  );

  const scaleX = useSpring(targetScaleX, DASH_SPRING);
  const isTip = tone === "tip";
  const isFilled = isTip || tone === "trail";
  const scaleY = useSpring(isTip ? EMPHASIS_SCALE_Y : 1, DASH_SPRING);
  const transform = useTransform(
    [scaleX, scaleY],
    ([x, y]: number[]) => `scaleX(${x}) scaleY(${y})`,
  );

  useEffect(() => {
    scaleY.set(isTip ? EMPHASIS_SCALE_Y : 1);
  }, [isTip, scaleY]);

  const aimed = aiming && hovered && hoverCue !== "none";
  const fillStyle =
    isFilled && fillOpacity != null
      ? {
          backgroundColor: `color-mix(in oklab, var(--foreground) ${Math.round(fillOpacity * 100)}%, transparent)`,
        }
      : undefined;

  return (
    <button
      ref={ref}
      type="button"
      aria-current={active ? "location" : undefined}
      aria-label={`Go to ${section.label}`}
      title={section.label}
      className="group flex h-2.25 items-center border-0 bg-transparent p-0 outline-none"
      style={{ width: MAX_DASH_WIDTH }}
      onClick={() => onSelect(section.id)}
    >
      <motion.span
        className={cn(
          "block transition-[background-color,opacity] duration-100 ease-out group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          DASH_HEIGHT_CLASS,
          isFilled
            ? fillOpacity == null && (aimed ? FILL_HOVER_CLASS : FILL_CLASS)
            : aimed
              ? preset.hoverClassName
              : preset.className,
          aiming && hoverCue !== "none" && !hovered && "dark:opacity-50",
        )}
        style={{
          transform: reduceMotion
            ? `scaleX(${restScaleX}) scaleY(1)`
            : transform,
          transformOrigin: side === "left" ? "left center" : "right center",
          width: MAX_DASH_WIDTH,
          ...fillStyle,
        }}
      />
    </button>
  );
};

const ProximitySidebar = ({
  activeOffset = 0.4,
  className,
  fillOpacity,
  hoverCue = "solid",
  side = "left",
  sections,
  ...props
}: ProximitySidebarProps) => {
  const mouseY = useMotionValue(Infinity);
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = Boolean(shouldReduceMotion);
  const dashRefs = useRef(new Map<string, HTMLButtonElement>());
  const centersRef = useRef(new Map<string, number>());
  const stackRef = useRef<HTMLDivElement>(null);
  const finePointer = useRef(false);
  const pointerInside = useRef(false);
  const resetTimer = useRef<number | null>(null);
  const scrollLock = useRef(false);
  const scrollLockTimer = useRef<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string>();
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const activeIndex = sections.findIndex((section) => section.id === activeId);
  const visualIndexRef = useRef(activeIndex);
  const [visualIndex, setVisualIndex] = useState(activeIndex);

  const sectionIds = useMemo(
    () => sections.map((section) => section.id).join("|"),
    [sections],
  );

  const [detectedKinds, setDetectedKinds] = useState(() =>
    resolveSectionKinds(sections, false),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextKinds = resolveSectionKinds(sections, true);
      setDetectedKinds((current) =>
        kindsMatch(current, nextKinds) ? current : nextKinds,
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [sections]);

  const recaptureCenters = useCallback(() => {
    for (const [id, node] of dashRefs.current) {
      centersRef.current.set(id, captureCenter(node));
    }
  }, []);

  const registerDash = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) {
        dashRefs.current.set(id, node);
        centersRef.current.set(id, captureCenter(node));
        return;
      }

      dashRefs.current.delete(id);
      centersRef.current.delete(id);
    },
    [],
  );

  const clearPendingReset = useCallback(() => {
    if (!resetTimer.current) return;
    window.clearTimeout(resetTimer.current);
    resetTimer.current = null;
  }, []);

  const clearScrollLock = useCallback(() => {
    if (!scrollLockTimer.current) return;
    window.clearTimeout(scrollLockTimer.current);
    scrollLockTimer.current = null;
  }, []);

  const releaseScrollLockSoon = useCallback(() => {
    clearScrollLock();
    scrollLockTimer.current = window.setTimeout(() => {
      scrollLock.current = false;
      scrollLockTimer.current = null;
    }, SCROLL_LOCK_IDLE);
  }, [clearScrollLock]);

  const pulseDash = useCallback(
    (id?: string) => {
      if (reduceMotion) return;

      if (!id) {
        mouseY.set(Infinity);
      } else {
        const node = dashRefs.current.get(id);
        if (node) {
          const center = captureCenter(node);
          centersRef.current.set(id, center);
          mouseY.set(center);
        }
      }

      clearPendingReset();
      if (!id || pointerInside.current) return;

      resetTimer.current = window.setTimeout(() => {
        mouseY.set(Infinity);
        resetTimer.current = null;
      }, SCROLL_IDLE_RESET_DELAY);
    },
    [clearPendingReset, mouseY, reduceMotion],
  );

  const selectSection = useCallback(
    (id: string) => {
      const element = getSectionElement(id);
      if (!element) return;

      // hold the clicked dash until programmatic scroll goes idle
      scrollLock.current = true;
      releaseScrollLockSoon();

      element.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
      pulseDash(id);
    },
    [pulseDash, reduceMotion, releaseScrollLockSoon],
  );

  useEffect(
    () => () => {
      clearPendingReset();
      clearScrollLock();
    },
    [clearPendingReset, clearScrollLock],
  );

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER);
    const sync = () => {
      finePointer.current = media.matches;
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    recaptureCenters();

    const observer = new ResizeObserver(recaptureCenters);
    observer.observe(stack);
    window.addEventListener("resize", recaptureCenters);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recaptureCenters);
    };
  }, [recaptureCenters, sectionIds]);

  useEffect(() => {
    if (!sections.length) return;

    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;

      if (scrollLock.current) {
        releaseScrollLockSoon();
        return;
      }

      let lastSection: ProximitySection | undefined;
      let lastElement: HTMLElement | null = null;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = getSectionElement(section.id);
        if (element) {
          lastSection = section;
          lastElement = element;
          break;
        }
      }

      if (
        lastSection &&
        lastElement &&
        isScrolledToEnd(getScrollParent(lastElement))
      ) {
        setActiveId(lastSection.id);
        if (!pointerInside.current) pulseDash(lastSection.id);
        return;
      }

      const anchorY = window.innerHeight * activeOffset;
      let nextActiveId = sections[0]?.id;

      for (const section of sections) {
        const element = getSectionElement(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= anchorY) {
          nextActiveId = section.id;
        }
      }

      setActiveId(nextActiveId);
      if (!pointerInside.current) pulseDash(nextActiveId);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    const interruptLock = (event: Event) => {
      if (!scrollLock.current) return;
      if (
        event.target instanceof Node &&
        stackRef.current?.contains(event.target)
      ) {
        return;
      }

      scrollLock.current = false;
      clearScrollLock();
    };

    const scrollParents = new Set<EventTarget>([window]);

    for (const section of sections) {
      const element = getSectionElement(section.id);
      if (element) scrollParents.add(getScrollParent(element));
    }

    updateActiveSection();

    for (const parent of scrollParents) {
      parent.addEventListener("scroll", scheduleUpdate, { passive: true });
      parent.addEventListener("wheel", interruptLock, { passive: true });
      parent.addEventListener("touchmove", interruptLock, { passive: true });
    }

    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      for (const parent of scrollParents) {
        parent.removeEventListener("scroll", scheduleUpdate);
        parent.removeEventListener("wheel", interruptLock);
        parent.removeEventListener("touchmove", interruptLock);
      }
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [
    activeOffset,
    clearScrollLock,
    pulseDash,
    releaseScrollLockSoon,
    sectionIds,
    sections,
  ]);

  useEffect(() => {
    const snap = () => {
      visualIndexRef.current = activeIndex;
      setVisualIndex((current) =>
        current === activeIndex ? current : activeIndex,
      );
    };

    // click: ease the fill to the target. scroll: snap tick by tick
    if (reduceMotion || !scrollLock.current) {
      snap();
      return;
    }

    const from = visualIndexRef.current < 0 ? 0 : visualIndexRef.current;
    if (from === activeIndex) {
      snap();
      return;
    }

    const controls = animate(from, activeIndex, {
      ...FILL_SPRING,
      onUpdate: (value) => {
        visualIndexRef.current = value;
        const next = Math.round(value);
        setVisualIndex((current) => (current === next ? current : next));
      },
      onComplete: snap,
    });

    return () => controls.stop();
  }, [activeIndex, reduceMotion]);

  return (
    <nav
      aria-label="Page sections"
      data-slot="proximity-sidebar"
      className={cn(
        "flex h-full min-h-0 items-center",
        side === "left" ? "justify-start" : "justify-end",
        className,
      )}
      {...props}
    >
      <div
        ref={stackRef}
        className={cn(
          "mx-8 flex flex-col gap-0",
          side === "right" ? "items-end" : "items-start",
        )}
        onPointerMove={(event) => {
          if (!pointerInside.current) recaptureCenters();
          clearPendingReset();
          pointerInside.current = true;

          if (!reduceMotion) mouseY.set(event.clientY);
          if (!finePointer.current) return;

          let nextId: string | undefined;
          let closest = Number.POSITIVE_INFINITY;

          for (const [id, center] of centersRef.current) {
            const distance = Math.abs(event.clientY - center);
            if (distance < closest) {
              closest = distance;
              nextId = id;
            }
          }

          setHoveredId((current) => (current === nextId ? current : nextId));
        }}
        onPointerLeave={() => {
          pointerInside.current = false;
          if (!reduceMotion) mouseY.set(Infinity);
          setHoveredId(undefined);
        }}
      >
        {sections.map((section, index) => {
          const sectionKind =
            section.kind || section.level
              ? getSectionKind(section)
              : (detectedKinds[section.id] ?? getSectionKind(section));

          return (
            <Dash
              key={section.id}
              active={section.id === activeId}
              aiming={Boolean(hoveredId)}
              centersRef={centersRef}
              fillOpacity={fillOpacity}
              hoverCue={hoverCue}
              hovered={section.id === hoveredId}
              mouseY={mouseY}
              onSelect={selectSection}
              preset={DASH_PRESETS[sectionKind]}
              reduceMotion={reduceMotion}
              registerDash={registerDash}
              section={section}
              side={side}
              tone={getDashTone(index, visualIndex)}
            />
          );
        })}
      </div>
    </nav>
  );
};

export default ProximitySidebar;
