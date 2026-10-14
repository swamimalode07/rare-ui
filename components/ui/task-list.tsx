"use client";

import { useState } from "react";
import type { ComponentProps, CSSProperties } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const POP_SCALE = [1, 1.08, 1];
const FLICK = [0, 8, -2, 0];
const FLICK_TIMES = [0, 0.35, 0.7, 1];

const FILL: Transition = { duration: 0.24, ease: EASE_OUT };
const POP: Transition = { duration: 0.34, ease: EASE_OUT, times: [0, 0.4, 1] };
const TICK: Transition = { duration: 0.22, ease: EASE_OUT, delay: 0.06 };
const STRIKE: Transition = { duration: 0.38, ease: EASE_IN_OUT };
const NUDGE: Transition = { duration: 0.3, ease: EASE_OUT, times: FLICK_TIMES };
const REORDER: Transition = { type: "spring", stiffness: 320, damping: 30 };
const INSTANT: Transition = { duration: 0 };

// dashes divide the circumference, so the ring closes without a seam
const RING_R = 11;
const RING_DASH = `1 ${(2 * Math.PI * RING_R) / 13 - 1}`;

// the strike rides on the text itself, so a label that wraps gets a line per row
const STRIKE_STYLE: CSSProperties = {
  backgroundImage: "linear-gradient(currentColor, currentColor)",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 52%",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};

// the check is one line box tall at every size, so it sits on the first line
const SIZES = {
  sm: {
    row: "gap-2.5 rounded-xl px-3 py-2",
    check: "h-5 w-5",
    text: "text-[13px] leading-5",
    line: "1.5px",
    list: "gap-1.5",
  },
  md: {
    row: "gap-3 rounded-[14px] px-3.5 py-2.5",
    check: "h-6 w-6",
    text: "text-[15px] leading-6",
    line: "2px",
    list: "gap-2",
  },
  lg: {
    row: "gap-3.5 rounded-2xl px-4 py-3",
    check: "h-7 w-7",
    text: "text-[17px] leading-7",
    line: "2.5px",
    list: "gap-2.5",
  },
} as const;

export type TaskSize = keyof typeof SIZES;

// ticking runs tick to strike to nudge, unticking runs the same road backwards
type Stage = "idle" | "tick" | "strike" | "nudge" | "settled" | "unstrike" | "untick";

type StageEvent = "CHECK" | "UNCHECK" | "DRAWN" | "STRUCK" | "FLICKED";

const NEXT: Record<Stage, Partial<Record<StageEvent, Stage>>> = {
  idle: { CHECK: "tick" },
  tick: { DRAWN: "strike", UNCHECK: "untick" },
  strike: { STRUCK: "nudge", UNCHECK: "unstrike" },
  nudge: { FLICKED: "settled", UNCHECK: "unstrike" },
  settled: { UNCHECK: "unstrike" },
  unstrike: { STRUCK: "untick", CHECK: "strike" },
  untick: { DRAWN: "idle", CHECK: "tick" },
};

const VIEW: Record<Stage, { filled: boolean; struck: boolean }> = {
  idle: { filled: false, struck: false },
  tick: { filled: true, struck: false },
  strike: { filled: true, struck: true },
  nudge: { filled: true, struck: true },
  settled: { filled: true, struck: true },
  unstrike: { filled: true, struck: false },
  untick: { filled: false, struck: false },
};

const ACCENT_VAR = "--task-accent";
const CARD =
  "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_3px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_6px_18px_rgba(0,0,0,0.09)] active:brightness-95 dark:bg-[#1F1F1F] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_10px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.45),0_6px_18px_rgba(0,0,0,0.4)] dark:active:brightness-110";
const FOCUS = `outline-none focus-visible:ring-2 focus-visible:ring-[var(${ACCENT_VAR})] focus-visible:ring-offset-2`;

function useTiming() {
  const reduced = useReducedMotion() ?? false;
  return (transition: Transition) => (reduced ? INSTANT : transition);
}

function TaskCheck({
  filled,
  size,
  onDrawn,
}: {
  filled: boolean;
  size: TaskSize;
  onDrawn: () => void;
}) {
  const timing = useTiming();

  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn(
        "shrink-0 text-neutral-300 dark:text-neutral-600",
        SIZES[size].check,
      )}
      initial={false}
      animate={{ scale: filled ? POP_SCALE : 1 }}
      transition={filled ? timing(POP) : INSTANT}
    >
      <motion.circle
        cx="12"
        cy="12"
        r={RING_R}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={RING_DASH}
        initial={false}
        animate={{ opacity: filled ? 0 : 1 }}
        transition={timing(FILL)}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="12"
        fill={`var(${ACCENT_VAR})`}
        style={{ transformBox: "view-box", transformOrigin: "12px 12px" }}
        initial={false}
        animate={{ scale: filled ? 1 : 0 }}
        transition={timing(FILL)}
      />
      <motion.path
        d="M7.4 12.4 10.6 15.5 16.6 8.9"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: filled ? 1 : 0, opacity: filled ? 1 : 0 }}
        transition={timing(TICK)}
        onAnimationComplete={onDrawn}
      />
    </motion.svg>
  );
}

function TaskLabel({
  label,
  struck,
  size,
  onStruck,
}: {
  label: string;
  struck: boolean;
  size: TaskSize;
  onStruck: () => void;
}) {
  const timing = useTiming();
  const { text, line } = SIZES[size];

  return (
    <span className="min-w-0 flex-1">
      <motion.span
        style={STRIKE_STYLE}
        className={cn(
          "font-medium tracking-[-0.01em] transition-colors duration-300",
          text,
          struck
            ? "text-neutral-400 dark:text-neutral-500"
            : "text-neutral-800 dark:text-neutral-100",
        )}
        initial={false}
        animate={{ backgroundSize: `${struck ? 100 : 0}% ${line}` }}
        transition={timing(STRIKE)}
        onAnimationComplete={onStruck}
      >
        {label}
      </motion.span>
    </span>
  );
}

export type TaskItemProps = Omit<
  ComponentProps<"button">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  size?: TaskSize;
  accent?: string;
  onCheckedChange?: (checked: boolean) => void;
  onSettled?: () => void;
  onReverted?: () => void;
};

export function TaskItem({
  label,
  checked,
  defaultChecked = false,
  size = "md",
  accent = "#FF5F2E",
  onCheckedChange,
  onSettled,
  onReverted,
  className,
  onClick,
  style,
  ...props
}: TaskItemProps) {
  const timing = useTiming();
  const [own, setOwn] = useState(defaultChecked);
  const done = checked ?? own;

  const [stage, setStage] = useState<Stage>(done ? 'settled' : 'idle');
  const [was, setWas] = useState(done);

  const send = (event: StageEvent) => {
    const next = NEXT[stage][event];
    if (!next) return;
    setStage(next);
    if (next === "settled") onSettled?.();
    if (next === "idle") onReverted?.();
  };

  // turn around in the same render the tick flips, so the row never paints stale
  if (was !== done) {
    setWas(done);
    const next = NEXT[stage][done ? "CHECK" : "UNCHECK"];
    if (next) setStage(next);
  }

  const onDrawn = () => send("DRAWN");
  const onStruck = () => send("STRUCK");
  const onFlicked = () => send("FLICKED");

  const { filled, struck } = VIEW[stage];

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={done}
      data-slot="task-item"
      data-state={done ? "checked" : "unchecked"}
      style={{ [ACCENT_VAR]: accent, ...style } as CSSProperties}
      onClick={(event) => {
        onClick?.(event);
        if (checked === undefined) setOwn(!done);
        onCheckedChange?.(!done);
      }}
      animate={{ x: stage === 'nudge' ? FLICK : 0 }}
      transition={stage === 'nudge' ? timing(NUDGE) : INSTANT}
      onAnimationComplete={onFlicked}
      className={cn(
        "flex w-fit max-w-full cursor-pointer items-start text-left transition-[filter,box-shadow] duration-300",
        SIZES[size].row,
        CARD,
        FOCUS,
        className,
      )}
      {...props}
    >
      <TaskCheck
        filled={filled}
        size={size}
        onDrawn={onDrawn}
      />
      <TaskLabel
        label={label}
        struck={struck}
        size={size}
        onStruck={onStruck}
      />
    </motion.button>
  );
}

export type Task = {
  id: string;
  label: string;
  done?: boolean;
};

export type TaskListProps = ComponentProps<"ul"> & {
  tasks?: Task[];
  defaultTasks?: Task[];
  size?: TaskSize;
  accent?: string;
  onTasksChange?: (tasks: Task[]) => void;
};

export function TaskList({
  tasks,
  defaultTasks = [],
  size = "md",
  accent,
  onTasksChange,
  className,
  ...props
}: TaskListProps) {
  const timing = useTiming();
  const [own, setOwn] = useState(defaultTasks);
  const current = tasks ?? own;

  const [parked, setParked] = useState<string[]>(() =>
    (tasks ?? defaultTasks).filter((task) => task.done).map((task) => task.id),
  );
  const [announcement, setAnnouncement] = useState("");

  const toggle = (task: Task, done: boolean) => {
    const next = current.map((item) =>
      item.id === task.id ? { ...item, done } : item,
    );
    if (tasks === undefined) setOwn(next);
    onTasksChange?.(next);
    setAnnouncement(`${task.label} ${done ? "completed" : "reopened"}`);
  };

  // a parked row that is no longer done, or gone, was changed from outside
  const finished = parked
    .map((id) => current.find((task) => task.id === id))
    .filter((task): task is Task => task?.done === true);
  const open = current.filter((task) => !finished.includes(task));

  return (
    <ul
      data-slot="task-list"
      className={cn(
        "flex w-fit max-w-full flex-col items-start",
        SIZES[size].list,
        className,
      )}
      {...props}
    >
      {[...open, ...finished].map((task) => (
        <motion.li
          key={task.id}
          layout
          transition={timing(REORDER)}
          className="max-w-full"
        >
          <TaskItem
            label={task.label}
            checked={!!task.done}
            size={size}
            accent={accent}
            onCheckedChange={(done) => toggle(task, done)}
            onSettled={() =>
              setParked((ids) =>
                ids.includes(task.id) ? ids : [...ids, task.id],
              )
            }
            onReverted={() =>
              setParked((ids) => ids.filter((id) => id !== task.id))
            }
          />
        </motion.li>
      ))}
      <li role="status" aria-live="polite" className="sr-only">
        {announcement}
      </li>
    </ul>
  );
}

export default TaskList;
