"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// the duration picker's spring, damped so nothing overshoots
const SPRING = { type: "spring", stiffness: 200, damping: 28, mass: 1 } as const;

const FADE_IN = "transition-colors duration-[400ms]";
const FADE_OUT = "transition-colors duration-0";

const SIZES = {
  sm: {
    label: "gap-1.5 px-3.5 py-2 text-xs leading-4 [&_svg]:size-3",
    radius: 10,
    separation: 16,
  },
  md: {
    label: "gap-2 px-5 py-2.5 text-sm leading-5 [&_svg]:size-3.5",
    radius: 12,
    separation: 20,
  },
  lg: {
    label: "gap-2.5 px-6 py-3 text-base leading-6 [&_svg]:size-4",
    radius: 14,
    separation: 24,
  },
} as const;

export type GooeyNavSize = keyof typeof SIZES;

type NavItem = { label: string; href?: string; icon?: ReactNode };

export type GooeyNavItem = string | NavItem;

const toItem = (item: GooeyNavItem): NavItem =>
  typeof item === "string" ? { label: item } : item;

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

type NavLabelProps = NavItem & {
  isActive: boolean;
  size: GooeyNavSize;
  activeLabelColor: string;
  onSelect: () => void;
};

function NavLabel({
  label,
  href,
  icon,
  isActive,
  size,
  activeLabelColor,
  onSelect,
}: NavLabelProps) {
  const props = {
    "data-slot": "gooey-nav-item",
    "data-active": isActive,
    "aria-current": isActive ? (href ? "page" : true) : undefined,
    className: cn(
      "flex cursor-pointer items-center whitespace-nowrap font-medium [&_svg]:shrink-0",
      isActive ? FADE_IN : FADE_OUT,
      SIZES[size].label,
      !isActive && "text-[#868593]",
    ),
    style: isActive ? { color: activeLabelColor } : undefined,
    onClick: onSelect,
  } as const;

  return href ? (
    <Link href={href} {...props}>
      {icon}
      {label}
    </Link>
  ) : (
    <button type="button" {...props}>
      {icon}
      {label}
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
          const isActive = i === active;

          return (
            <motion.li
              key={i}
              data-slot="gooey-nav-segment"
              className={cn(
                "bg-[#F4F4F9] dark:bg-[#262626]",
                isActive ? FADE_IN : FADE_OUT,
              )}
              style={{ backgroundColor: isActive ? activeColor : undefined }}
              initial={false}
              animate={shape(i)}
              transition={reduced ? { duration: 0 } : SPRING}
            >
              <NavLabel
                {...toItem(item)}
                isActive={isActive}
                size={size}
                activeLabelColor={activeLabelColor}
                onSelect={() => select(i)}
              />
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
