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
const LINE = 1.35;
const FADE =
  "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)";

const EASE = [0.22, 1, 0.36, 1] as const;
const BOUNCE = 0.18;
const LEAVE = { duration: 0.18, ease: EASE } as const;
const INSTANT = { duration: 0 } as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;

export type Grouping = "western" | "indian";

const EVERY_THREE = /\B(?=(\d{3})+(?!\d))/g;
const EVERY_TWO = /\B(?=(\d{2})+(?!\d))/g;

function group(whole: string, separator: string, grouping: Grouping) {
  if (!separator) return whole;
  if (grouping === "western") return whole.replace(EVERY_THREE, separator);

  // indian: three at the end, pairs the rest of the way up
  const head = whole.slice(0, -3);
  if (!head) return whole;
  return `${head.replace(EVERY_TWO, separator)}${separator}${whole.slice(-3)}`;
}

function format(
  scaled: number,
  places: number,
  pad: number,
  separator: string,
  decimalSeparator: string,
  grouping: Grouping,
) {
  const raw = String(scaled).padStart(places + pad, "0");
  const whole = group(
    raw.slice(0, raw.length - places) || "0",
    separator,
    grouping,
  );
  return places
    ? `${whole}${decimalSeparator}${raw.slice(raw.length - places)}`
    : whole;
}

// rides the layout animation so it tracks the digits when the number gains or loses a place
function Fixed({
  reduced,
  shape,
  shift,
  children,
}: {
  reduced: boolean;
  shape: number;
  shift: Transition;
  children: ReactNode;
}) {
  return (
    <motion.span
      layout={!reduced}
      layoutDependency={shape}
      transition={shift}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
}

const Digit = memo(function Digit({
  digit,
  from,
  dir,
  duration,
  reduced,
  shape,
  shift,
  ref,
}: {
  digit: number;
  from: number;
  dir: number;
  duration: number;
  reduced: boolean;
  shape: number;
  shift: Transition;
  // popLayout measures the leaving column through this
  ref?: Ref<HTMLSpanElement>;
}) {
  const pos = useMotionValue(from);
  const goal = useRef(from);
  const y = useTransform(pos, (p) => `${(-mod(p, 10) * 100) / WHEEL.length}%`);

  useEffect(() => {
    if (reduced) {
      goal.current = digit;
      pos.set(digit);
      return;
    }
    // only choose a new landing spot when the face itself changed; re-running for any
    // other reason re-aims at the same spot, so a reversal cannot send a wheel the
    // long way round to the digit it is already heading for
    if (mod(goal.current, 10) !== digit) {
      // aim from where the wheel actually is, so a value that keeps changing retargets
      // within one turn instead of queueing up a backlog of them
      const at = pos.get();
      goal.current =
        dir < 0 ? at - mod(at - digit, 10) : at + mod(digit - at, 10);
    }
    const roll = animate(pos, goal.current, {
      type: "spring",
      visualDuration: duration,
      bounce: BOUNCE,
    });
    return () => roll.stop();
  }, [digit, dir, duration, reduced, pos]);

  return (
    <motion.span
      ref={ref}
      layout={!reduced}
      layoutDependency={shape}
      transition={shift}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: reduced ? INSTANT : LEAVE }}
      className="relative inline-grid overflow-hidden"
      style={{
        height: `${LINE}em`,
        lineHeight: LINE,
        maskImage: FADE,
        WebkitMaskImage: FADE,
      }}
    >
      {/* holds the column at the width of the widest face, for fonts with no tabular figures */}
      {FACES.map((face) => (
        <span key={face} aria-hidden className="invisible [grid-area:1/1]">
          {face}
        </span>
      ))}
      <motion.span style={{ y }} className="absolute inset-x-0 top-0">
        {WHEEL.map((face, index) => (
          <span
            key={index}
            className="flex items-center justify-center"
            style={{ height: `${LINE}em` }}
          >
            {face}
          </span>
        ))}
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

  const [previous, setPrevious] = useState(value);
  const [dir, setDir] = useState(1);
  if (previous !== value) {
    setDir(value >= previous ? 1 : -1);
    setPrevious(value);
  }

  const places = Math.max(0, Math.trunc(decimals));
  const scaled = Math.round(Math.abs(value) * 10 ** places);
  const pad = Math.max(1, Math.trunc(padStart));
  const shown = Math.max(String(scaled).length, places + pad);

  const chars = format(
    scaled,
    places,
    shown - places,
    separator,
    decimalSeparator,
    grouping,
  );

  // the faces on screen at mount; a place that shows up later starts from 0 and rolls in
  const [seed] = useState(() => {
    const faces: Record<number, number> = {};
    let index = 0;
    for (const char of chars) {
      if (/\d/.test(char)) faces[shown - index++] = Number(char);
    }
    return faces;
  });

  // everything that moves when a place is gained or lost rides the same spring as the
  // wheels, so the symbols and the digits travel together instead of arriving apart
  const shift = useMemo<Transition>(
    () =>
      reduced
        ? INSTANT
        : { type: "spring", visualDuration: duration, bounce: BOUNCE },
    [reduced, duration],
  );

  const fixed = { reduced, shape: chars.length, shift };

  let seen = 0;
  const cells = [...chars].map((char) => {
    if (!/\d/.test(char)) {
      return (
        <motion.span
          key={`mark-${shown - seen}`}
          layout={!reduced}
          layoutDependency={chars.length}
          transition={shift}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: reduced ? INSTANT : LEAVE }}
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    }
    const place = shown - seen++;
    return (
      <Digit
        key={place}
        digit={Number(char)}
        from={seed[place] ?? 0}
        dir={dir}
        duration={duration}
        reduced={reduced}
        shape={chars.length}
        shift={shift}
      />
    );
  });

  return (
    <span
      data-slot="animated-counter"
      className={cn("inline-flex items-center tabular-nums", className)}
      {...props}
    >
      {prefix != null && <Fixed {...fixed}>{prefix}</Fixed>}
      <span className="sr-only">
        {value < 0 && scaled > 0 ? "-" : ""}
        {chars}
      </span>
      <span aria-hidden className="inline-flex select-none items-center">
        {value < 0 && scaled > 0 && <Fixed {...fixed}>-</Fixed>}
        <AnimatePresence mode="popLayout" initial={false}>
          {cells}
        </AnimatePresence>
      </span>
      {suffix != null && <Fixed {...fixed}>{suffix}</Fixed>}
    </span>
  );
}

export default AnimatedCounter;
