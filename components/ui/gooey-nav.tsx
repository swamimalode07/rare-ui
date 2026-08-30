"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const GAP_SPRING = { type: "spring", duration: 0.72, bounce: 0.38 } as const;
const CORNER_SPRING = {
  type: "spring",
  duration: 0.5,
  bounce: 0.15,
  delay: 0.05,
} as const;

const TRANSITION = {
  default: GAP_SPRING,
  borderTopLeftRadius: CORNER_SPRING,
  borderBottomLeftRadius: CORNER_SPRING,
  borderTopRightRadius: CORNER_SPRING,
  borderBottomRightRadius: CORNER_SPRING,
};

const SIZES = {
  sm: { label: "px-3.5 py-2 text-xs leading-4", radius: 10, separation: 16 },
  md: { label: "px-5 py-2.5 text-sm leading-5", radius: 12, separation: 20 },
  lg: { label: "px-6 py-3 text-base leading-6", radius: 14, separation: 24 },
} as const;

export type GooeyNavSize = keyof typeof SIZES;

export type GooeyNavItem = string | { label: string; href?: string };

export type GooeyNavProps = Omit<ComponentProps<"nav">, "onChange"> & {
  items: GooeyNavItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  size?: GooeyNavSize;
  activeColor?: string;
  activeLabelColor?: string;
  separation?: number;
  radius?: number;
};

const toItem = (item: GooeyNavItem) =>
  typeof item === "string" ? { label: item, href: undefined } : item;

type NavLabelProps = {
  href?: string;
  isActive: boolean;
  size: GooeyNavSize;
  activeLabelColor: string;
  onSelect: () => void;
  children: ReactNode;
};

function NavLabel({
  href,
  isActive,
  size,
  activeLabelColor,
  onSelect,
  children,
}: NavLabelProps) {
  const props = {
    "data-slot": "gooey-nav-item",
    "data-active": isActive,
    "aria-current": isActive ? (href ? "page" : true) : undefined,
    className: cn(
      "block cursor-pointer whitespace-nowrap font-medium transition-colors duration-500",
      SIZES[size].label,
      !isActive && "text-[#868593]",
    ),
    style: isActive ? { color: activeLabelColor } : undefined,
    onClick: onSelect,
  } as const;

  return href ? (
    <Link href={href} {...props}>
      {children}
    </Link>
  ) : (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function GooeyNav({
  items,
  value,
  defaultValue = 0,
  onChange,
  size = "md",
  activeColor = "#FC4C01",
  activeLabelColor = "#ffffff",
  separation,
  radius,
  className,
  ...props
}: GooeyNavProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const routeIndex = items.findIndex((item) => toItem(item).href === pathname);
  const [uncontrolled, setUncontrolled] = useState(() =>
    routeIndex === -1 ? defaultValue : routeIndex,
  );
  const [seenRoute, setSeenRoute] = useState(routeIndex);

  // in render, not an effect: an effect here cascades renders
  if (routeIndex !== seenRoute) {
    setSeenRoute(routeIndex);
    if (routeIndex !== -1) setUncontrolled(routeIndex);
  }

  const active = value ?? uncontrolled;
  const gap = separation ?? SIZES[size].separation;
  const corner = radius ?? SIZES[size].radius;

  const open = (seam: number) =>
    seam === 0 ||
    seam === items.length ||
    seam - 1 === active ||
    seam === active;

  const shape = (i: number) => ({
    // closed seams pull in a pixel so no hairline shows through
    marginLeft: i === 0 ? 0 : open(i) ? gap : -1,
    borderTopLeftRadius: open(i) ? corner : 0,
    borderBottomLeftRadius: open(i) ? corner : 0,
    borderTopRightRadius: open(i + 1) ? corner : 0,
    borderBottomRightRadius: open(i + 1) ? corner : 0,
  });

  const select = (i: number) => {
    if (value === undefined) setUncontrolled(i);
    onChange?.(i);
  };

  return (
    <nav
      data-slot="gooey-nav"
      className={cn("inline-block", className)}
      {...props}
    >
      <ul className="flex items-center">
        {items.map((item, i) => {
          const { label, href } = toItem(item);
          const isActive = i === active;

          return (
            <motion.li
              key={i}
              data-slot="gooey-nav-segment"
              className="bg-[#F4F4F9] transition-colors duration-500 dark:bg-[#262626]"
              style={{ backgroundColor: isActive ? activeColor : undefined }}
              initial={false}
              animate={shape(i)}
              transition={reduced ? { duration: 0 } : TRANSITION}
            >
              <NavLabel
                href={href}
                isActive={isActive}
                size={size}
                activeLabelColor={activeLabelColor}
                onSelect={() => select(i)}
              >
                {label}
              </NavLabel>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
