"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { animate } from "motion";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type BounceSidebarItem = string | { label: string; href?: string };

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  items: BounceSidebarItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  dotColor?: string;
};

const PRESS = {
  type: "spring",
  stiffness: 700,
  damping: 40,
  mass: 0.35,
} as const;
const STIFF = {
  type: "spring",
  stiffness: 820,
  damping: 10,
  mass: 0.4,
} as const;
const MOVE_NEAR = 0.22;
const MOVE_FAR = 0.28;
const NEAR_APEX = 8;
const FAR_APEX = 16;

export function BounceSidebar({
  items,
  value,
  defaultValue = 0,
  onChange,
  dotColor = "#FC4C01",
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;
  const reduceMotion = Boolean(useReducedMotion());

  const dot = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);
  const prevIndex = useRef<number | null>(null);
  const playback = useRef<{ stop: () => void } | null>(null);
  const hopGen = useRef(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  const [dotSize, setDotSize] = useState(6);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    setDotSize(Math.round(6 * dpr) / dpr);
  }, []);

  const snapTo = useCallback(
    (toY: number, index?: number) => {
      hopGen.current += 1;
      playback.current?.stop();
      x.set(0);
      y.set(toY);
      scaleX.set(1);
      scaleY.set(1);
      prevY.current = toY;
      if (index != null) prevIndex.current = index;
    },
    [scaleX, scaleY, x, y],
  );

  const pressIn = useCallback(() => {
    if (reduceMotion) return;
    animate(scaleY, 1.32, PRESS);
    animate(scaleX, 0.58, PRESS);
  }, [reduceMotion, scaleX, scaleY]);

  const land = useCallback(() => {
    if (reduceMotion) return;
    animate(scaleX, 1, STIFF);
    animate(scaleY, 1, STIFF);
  }, [reduceMotion, scaleX, scaleY]);

  const bounceInPlace = useCallback(() => {
    if (reduceMotion) return;
    playback.current?.stop();
    const gen = ++hopGen.current;
    const controls: { stop: () => void }[] = [];
    playback.current = {
      stop: () => {
        hopGen.current += 1;
        for (const control of controls) control.stop();
      },
    };
    const squashY = animate(scaleY, 1.32, PRESS);
    const squashX = animate(scaleX, 0.58, PRESS);
    const xOut = animate(x, -NEAR_APEX, {
      type: "spring",
      bounce: 0,
      duration: MOVE_NEAR * 0.4,
    });
    controls.push(squashX, squashY, xOut);
    xOut.then(() => {
      if (gen !== hopGen.current) return;
      land();
      controls.push(animate(x, 0, STIFF));
    });
  }, [land, reduceMotion, scaleX, scaleY, x]);

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    const snap = () => {
      const el = itemRefs.current[activeIndex];
      if (cancelled || !el || !dot.current) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(6 * dpr) / dpr;
      const toY =
        Math.round((el.offsetTop + el.offsetHeight / 2 - size / 2) * dpr) / dpr;
      snapTo(toY, activeIndex);
      setReady(true);
    };

    snap();
    const raf = requestAnimationFrame(snap);
    document.fonts?.ready.then(snap);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el || !dot.current) return;

    const dpr = window.devicePixelRatio || 1;
    const toY =
      Math.round((el.offsetTop + el.offsetHeight / 2 - dotSize / 2) * dpr) /
      dpr;

    if (prevY.current === null) {
      snapTo(toY, activeIndex);
      return;
    }

    playback.current?.stop();
    const fromY = y.get();
    const delta = toY - fromY;
    const fromIndex = prevIndex.current ?? activeIndex;
    const steps = Math.abs(activeIndex - fromIndex);
    prevY.current = toY;
    prevIndex.current = activeIndex;
    if (Math.abs(delta) < 0.5) return;

    if (reduceMotion) {
      snapTo(toY, activeIndex);
      return;
    }

    const gen = ++hopGen.current;
    const controls: { stop: () => void }[] = [];
    playback.current = {
      stop: () => {
        hopGen.current += 1;
        for (const control of controls) control.stop();
      },
    };

    const move = steps <= 1 ? MOVE_NEAR : MOVE_FAR;
    const apex = steps <= 1 ? NEAR_APEX : FAR_APEX;
    const yMove = animate(y, toY, {
      type: "spring",
      bounce: 0,
      duration: move,
    });
    const xOut = animate(x, -apex, {
      type: "spring",
      bounce: 0,
      duration: move * 0.4,
    });
    controls.push(yMove, xOut);
    xOut.then(() => {
      if (gen !== hopGen.current) return;
      controls.push(animate(x, 0, STIFF));
    });
    yMove.then(() => {
      if (gen !== hopGen.current) return;
      land();
    });
  }, [activeIndex, dotSize, land, reduceMotion, snapTo, x, y]);

  const select = (index: number) => {
    if (index === activeIndex) return;
    if (value === undefined) setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      data-slot="bounce-sidebar"
      className={cn("relative flex flex-col gap-1 pl-6", className)}
      {...props}
    >
      <motion.span
        ref={dot}
        aria-hidden
        className="absolute left-2 top-0 rounded-full transition-opacity duration-150"
        style={{
          x,
          y,
          scaleX,
          scaleY,
          width: dotSize,
          height: dotSize,
          backgroundColor: dotColor,
          opacity: ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const label = typeof item === "string" ? item : item.label;
        const href = typeof item === "string" ? undefined : item.href;
        const isActive = index === activeIndex;
        const itemClassName = cn(
          "flex w-full cursor-pointer items-center rounded-lg p-1 text-left text-sm transition-colors duration-200",
          isActive ? "text-foreground" : "text-foreground/50",
        );
        const pointerRelease = {
          onPointerDown: pressIn,
          onPointerUp: () => {
            if (index === activeIndex) bounceInPlace();
          },
          onPointerCancel: land,
          onPointerLeave: land,
        };

        return (
          <li
            key={label}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {href ? (
              <MotionLink
                href={href}
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
                {...pointerRelease}
              >
                {label}
              </MotionLink>
            ) : (
              <motion.button
                type="button"
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
                {...pointerRelease}
              >
                {label}
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
