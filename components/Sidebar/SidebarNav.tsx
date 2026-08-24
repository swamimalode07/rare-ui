"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  components,
  type ComponentCategory,
  type ComponentItem,
} from "@/lib/components";
import { cn } from "@/lib/utils";
import { SCROLL_FADE, SCROLL_SELECTOR } from "./SidebarScroll";

const ACTIVE_COLOR = "#FC4C01";
const CORNER = 6;
const DASH =
  "repeating-linear-gradient(to top, transparent 0 2px, currentColor 2px 4px)";

const Rail = ({
  from = 0,
  y,
  visible,
  color,
  className,
}: {
  from?: number;
  y: number | null;
  visible: boolean;
  color?: string;
  className?: string;
}) => (
  <span
    aria-hidden
    style={{ opacity: visible && y !== null ? 1 : 0, color }}
    className={cn(
      "pointer-events-none absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none",
      className,
    )}
  >
    <span
      style={{
        top: from,
        height: Math.max(0, (y ?? 0) - CORNER - from),
        backgroundImage: DASH,
      }}
      className="absolute left-[2px] w-px transition-[top,height] duration-200 motion-reduce:transition-none"
    />
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      style={{ top: (y ?? 0) - CORNER }}
      className="absolute left-[2px] transition-[top] duration-200 motion-reduce:transition-none"
    >
      <path
        d="M0.5 0a6 6 0 0 0 6 6H12"
        stroke="currentColor"
        strokeDasharray="2 2"
      />
    </svg>
  </span>
);

// bucketing keeps a category that is missing from CATEGORY_ORDER in the nav
const buckets = new Map<ComponentCategory, ComponentItem[]>();
for (const component of components) {
  const bucket = buckets.get(component.category);
  if (bucket) bucket.push(component);
  else buckets.set(component.category, [component]);
}

const rank = (category: ComponentCategory) => {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
};

const groups = [...buckets.entries()]
  .sort(([a], [b]) => rank(a) - rank(b))
  .map(([category, items]) => ({
    category,
    label: CATEGORY_LABELS[category],
    items,
  }));

const SidebarGroup = ({
  label,
  items,
  activeHref,
  onNavigate,
}: {
  label: string;
  items: ComponentItem[];
  activeHref: string;
  onNavigate?: () => void;
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [centers, setCenters] = useState<number[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const hovering = pointerInside || focusInside;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(() => {
      setCenters(
        itemRefs.current.map((el) =>
          el ? el.offsetTop + el.offsetHeight / 2 : 0,
        ),
      );
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const activeIndex = items.findIndex((item) => item.href === activeHref);

  // reveals the active row when landing straight on a page whose entry sits off-screen
  useEffect(() => {
    const item = itemRefs.current[activeIndex];
    const scroller = item?.closest<HTMLElement>(SCROLL_SELECTOR);
    if (!item || !scroller) return;

    const itemBox = item.getBoundingClientRect();
    const scrollBox = scroller.getBoundingClientRect();
    const above = itemBox.top - (scrollBox.top + SCROLL_FADE);
    const below = itemBox.bottom - (scrollBox.bottom - SCROLL_FADE);

    if (above < 0) scroller.scrollTop += above;
    else if (below > 0) scroller.scrollTop += below;
  }, [activeIndex]);

  const activeY = activeIndex === -1 ? null : (centers[activeIndex] ?? null);
  const hoverY = hoverIndex === null ? null : (centers[hoverIndex] ?? null);

  // starts the neutral line where the orange one ends, so the two never overlap
  const hoverFrom =
    activeY === null
      ? 0
      : hoverY !== null && hoverY > activeY
        ? activeY
        : Math.max(0, (hoverY ?? 0) - CORNER);

  return (
    <div className="flex flex-col">
      <span className="pb-2 pl-[2px] pr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/40">
        {label}
      </span>

      <div
        ref={listRef}
        onMouseLeave={() => setPointerInside(false)}
        className="relative flex flex-col gap-0.5"
      >
        <Rail
          from={hoverFrom}
          y={hoverY}
          visible={hovering && hoverIndex !== activeIndex}
          className="text-foreground/30"
        />
        <Rail y={activeY} visible={activeY !== null} color={ACTIVE_COLOR} />

        {items.map((item, index) => {
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onClick={onNavigate}
              onMouseEnter={() => {
                setHoverIndex(index);
                setPointerInside(true);
              }}
              onFocus={() => {
                setHoverIndex(index);
                setFocusInside(true);
              }}
              onBlur={() => setFocusInside(false)}
              data-active={isActive}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-lg py-1.5 pl-5 pr-2 text-sm transition-colors duration-200",
                isActive
                  ? "bg-foreground/8 text-foreground"
                  : "text-foreground/50 hover:text-foreground/80",
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const SidebarNav = ({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Components"
      data-slot="sidebar-nav"
      className={cn("flex flex-col gap-5", className)}
    >
      {groups.map((group) => (
        <SidebarGroup
          key={group.category}
          label={group.label}
          items={group.items}
          activeHref={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;
