"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, ReactNode, Ref } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from "motion/react";

import { cn } from "@/lib/utils";

const FACES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
// the trailing 0 makes the wrap from 9 back to 0 land on an identical face
const WHEEL = [...FACES, 0];

// the air around each face is what the mask fades through, so a resting digit stays solid
const LINE = 1.5;
// eased rather than a straight ramp; a linear fade of the same width reads as a hard edge
const FADE = `linear-gradient(to bottom,
  rgba(0,0,0,0) 0%,
  rgba(0,0,0,0.06) 5.5%,
  rgba(0,0,0,0.5) 11%,
  rgba(0,0,0,0.94) 16.5%,
  #000 22%,
  #000 78%,
  rgba(0,0,0,0.94) 83.5%,
  rgba(0,0,0,0.5) 89%,
  rgba(0,0,0,0.06) 94.5%,
  rgba(0,0,0,0) 100%)`;

const EASE = [0.22, 1, 0.36, 1] as const;
const BOUNCE = 0.18;
const LEAVE = { duration: 0.18, ease: EASE } as const;
const INSTANT = { duration: 0 } as const;

const spring = (duration: number): Transition => ({
  type: "spring",
  visualDuration: duration,
  bounce: BOUNCE,
});

const MAX_DECIMALS = 15;
const MAX_PAD = 24;
const MIN_DURATION = 0.01;
const MAX_DURATION = 60;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (n: number, low: number, high: number) =>
  Math.min(high, Math.max(low, Number.isFinite(n) ? n : low));
const isDigit = (char: string) => char >= "0" && char <= "9";

// built once so React skips reconciling 21 spans per digit on every change
const SIZER = FACES.map((face) => (
  <span key={face} aria-hidden className="invisible [grid-area:1/1]">
    {face}
  </span>
));

const STACK = WHEEL.map((face, index) => (
  <span
    key={index}
    className="flex items-center justify-center"
    style={{ height: `${LINE}em` }}
  >
    {face}
  </span>
));

export type Grouping = "western" | "indian";

const EVERY_THREE = /\B(?=(\d{3})+(?!\d))/g;
const EVERY_TWO = /\B(?=(\d{2})+(?!\d))/g;

function group(whole: string, separator: string, grouping: Grouping) {
  if (!separator) return whole;
  if (grouping !== "indian") return whole.replace(EVERY_THREE, separator);

  // indian: three at the end, pairs the rest of the way up
  const head = whole.slice(0, -3);
  if (!head) return whole;
  return `${head.replace(EVERY_TWO, separator)}${separator}${whole.slice(-3)}`;
}

type Shape = {
  amount: number;
  scaled: number;
  places: number;
  pace: number;
  width: number;
};

function measure(
  value: number,
  decimals: number,
  padStart: number,
  duration: number,
): Shape {
  // NaN would make the previous-value comparison true forever
  const amount = Number.isFinite(value) ? value : 0;
  const places = clamp(Math.trunc(decimals), 0, MAX_DECIMALS);
  const pad = clamp(Math.trunc(padStart), 1, MAX_PAD);
  // past MAX_SAFE_INTEGER the digits are noise, and past 1e21 String() turns exponential
  const scaled = Math.min(
    Number.MAX_SAFE_INTEGER,
    Math.round(Math.abs(amount) * 10 ** places),
  );

  return {
    amount,
    scaled,
    places,
    pace: clamp(duration, MIN_DURATION, MAX_DURATION),
    width: Math.max(String(scaled).length, places + pad),
  };
}

function format(
  { scaled, places, width }: Shape,
  separator: string,
  decimalSeparator: string,
  grouping: Grouping,
) {
  const raw = String(scaled).padStart(width, "0");
  const whole = group(
    raw.slice(0, raw.length - places) || "0",
    separator,
    grouping,
  );
  return places
    ? `${whole}${decimalSeparator}${raw.slice(raw.length - places)}`
    : whole;
}

// keyed by distance from the right, so gaining a place moves columns rather than remounting them
type Cell =
  | { kind: "digit"; key: number; digit: number }
  | { kind: "mark"; key: string; char: string };

function toCells(chars: string, width: number): Cell[] {
  const cells: Cell[] = [];
  let seen = 0;
  // only digits advance the place, so a multi-character separator would repeat a key
  let run = 0;

  for (const char of chars) {
    if (isDigit(char)) {
      run = 0;
      cells.push({ kind: "digit", key: width - seen++, digit: Number(char) });
    } else {
      cells.push({ kind: "mark", key: `mark-${width - seen}-${run++}`, char });
    }
  }
  return cells;
}

function useWheel(
  from: number,
  digit: number,
  dir: number,
  duration: number,
  reduced: boolean,
) {
  const pos = useMotionValue(from);
  const goal = useRef(from);

  // read rather than depended on: a reversal alone must not restart every column
  const heading = useRef(dir);
  useEffect(() => {
    heading.current = dir;
  }, [dir]);

  useEffect(() => {
    if (reduced) {
      goal.current = digit;
      pos.set(digit);
      return;
    }
    // re-aim only when the face changed, or a reversal sends the wheel the long way round
    if (mod(goal.current, 10) !== digit) {
      // aim from where the wheel is, so a moving value never queues up a backlog of turns
      const at = pos.get();
      goal.current =
        heading.current < 0
          ? at - mod(at - digit, 10)
          : at + mod(digit - at, 10);
    }
    const roll = animate(pos, goal.current, spring(duration));
    return () => roll.stop();
  }, [digit, duration, reduced, pos]);

  return useTransform(pos, (p) => `${(-mod(p, 10) * 100) / WHEEL.length}%`);
}

type SlotProps = {
  reduced: boolean;
  dep: number;
  shift: Transition;
};

const shifts = ({ reduced, dep, shift }: SlotProps) => ({
  layout: !reduced,
  layoutDependency: dep,
  transition: shift,
});

const fades = (reduced: boolean) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: reduced ? INSTANT : LEAVE },
});

function Fixed({ children, ...slot }: SlotProps & { children: ReactNode }) {
  return (
    <motion.span {...shifts(slot)} className="inline-block">
      {children}
    </motion.span>
  );
}

function Mark({
  char,
  ref,
  ...slot
}: SlotProps & { char: string; ref?: Ref<HTMLSpanElement> }) {
  return (
    <motion.span
      ref={ref}
      data-slot="animated-counter-mark"
      {...shifts(slot)}
      {...fades(slot.reduced)}
      className="inline-block"
    >
      {char}
    </motion.span>
  );
}

const Digit = memo(function Digit({
  digit,
  from,
  dir,
  duration,
  ref,
  ...slot
}: SlotProps & {
  digit: number;
  from: number;
  dir: number;
  duration: number;
  // popLayout measures the leaving column through this
  ref?: Ref<HTMLSpanElement>;
}) {
  const y = useWheel(from, digit, dir, duration, slot.reduced);

  return (
    <motion.span
      ref={ref}
      data-slot="animated-counter-digit"
      {...shifts(slot)}
      {...fades(slot.reduced)}
      className="relative inline-grid overflow-hidden"
      style={{
        height: `${LINE}em`,
        lineHeight: LINE,
        maskImage: FADE,
        WebkitMaskImage: FADE,
      }}
    >
      {/* widest-face width, for fonts with no tabular figures */}
      {SIZER}
      <motion.span style={{ y }} className="absolute inset-x-0 top-0">
        {STACK}
      </motion.span>
    </motion.span>
  );
});

export type AnimatedCounterProps = Omit<
  ComponentProps<"span">,
  | "children"
  | "prefix"
  | "onAnimationStart"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
> & {
  value: number;
  decimals?: number;
  duration?: number;
  padStart?: number;
  separator?: string;
  decimalSeparator?: string;
  grouping?: Grouping;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function AnimatedCounter({
  value,
  decimals = 0,
  duration = 0.6,
  padStart = 1,
  separator = ",",
  decimalSeparator = ".",
  grouping = "western",
  prefix,
  suffix,
  className,
  ...props
}: AnimatedCounterProps) {
  const reduced = useReducedMotion() ?? false;

  const shape = measure(value, decimals, padStart, duration);
  const chars = format(shape, separator, decimalSeparator, grouping);
  const cells = toCells(chars, shape.width);
  const negative = shape.amount < 0 && shape.scaled > 0;

  const [previous, setPrevious] = useState(shape.amount);
  const [dir, setDir] = useState(1);
  if (previous !== shape.amount) {
    setDir(shape.amount >= previous ? 1 : -1);
    setPrevious(shape.amount);
  }

  // faces at mount; a place that appears later starts from 0 and rolls in
  const [seed] = useState(() => {
    const faces: Record<number, number> = {};
    for (const cell of cells) {
      if (cell.kind === "digit") faces[cell.key] = cell.digit;
    }
    return faces;
  });

  const shift = useMemo<Transition>(
    () => (reduced ? INSTANT : spring(shape.pace)),
    [reduced, shape.pace],
  );

  const slot: SlotProps = { reduced, dep: chars.length, shift };

  return (
    <span
      data-slot="animated-counter"
      className={cn("inline-flex items-center tabular-nums", className)}
      {...props}
    >
      {prefix != null && <Fixed {...slot}>{prefix}</Fixed>}

      <span className="sr-only">
        {negative ? "-" : ""}
        {chars}
      </span>

      <span aria-hidden className="inline-flex select-none items-center">
        {negative && <Fixed {...slot}>-</Fixed>}
        <AnimatePresence mode="popLayout" initial={false}>
          {cells.map((cell) =>
            cell.kind === "digit" ? (
              <Digit
                key={cell.key}
                {...slot}
                digit={cell.digit}
                from={seed[cell.key] ?? 0}
                dir={dir}
                duration={shape.pace}
              />
            ) : (
              <Mark key={cell.key} {...slot} char={cell.char} />
            ),
          )}
        </AnimatePresence>
      </span>

      {suffix != null && <Fixed {...slot}>{suffix}</Fixed>}
    </span>
  );
}

export default AnimatedCounter;
