"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
  type MotionValue,
  type Transition,
} from "motion/react";
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type HandoffAgent = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

export type HandoffPickerProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  agents: HandoffAgent[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  visibleCount?: number;
  disabled?: boolean;
};

const PITCH = 46;
const AVATAR = 30;
const SNAP: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.14 };
const LIFT: Transition = { type: "spring", visualDuration: 0.34, bounce: 0.2 };

// trackpad momentum keeps firing wheel events after the fingers lift, so the snap waits for a gap
const SETTLE = 140;
// how far past the first and last agent the column can ever reach, in agents
const OVERSHOOT = 0.55;
// the accumulator is capped as well, otherwise scrolling far past the end leaves a dead zone on the way back
const RAW_CAP = 2;

// asymptotic, so the pull approaches OVERSHOOT and never exceeds it however hard the column is thrown
const pull = (excess: number) => (excess * OVERSHOOT) / (excess + OVERSHOOT);
// a flick should carry, but projecting the raw velocity overshoots the list on a hard swipe
const THROW = 0.14;
// movement under this stays a click, so a shaky tap still selects the agent it landed on
const SLOP = 3;

const clamp = (n: number, low: number, high: number) =>
  Math.min(high, Math.max(low, n));

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      animate={{ rotate: open ? 0 : 180 }}
      transition={LIFT}
      aria-hidden
    >
      <path
        d="M6 14.5L12 8.5L18 14.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function Avatar({
  agent,
  className,
}: {
  agent: HandoffAgent;
  className?: string;
}) {
  return (
    <span
      className={cn(
        // the value gap against the pill is what separates the circle, so it needs no outline
        // greyscale so a set of unrelated brand marks reads as one row rather than five palettes
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1C1C1E] text-white grayscale dark:bg-[#151516]",
        className,
      )}
      style={{ width: AVATAR, height: AVATAR }}
    >
      {agent.icon}
    </span>
  );
}

function Option({
  agent,
  index,
  offset,
  selected,
  onPick,
}: {
  agent: HandoffAgent;
  index: number;
  offset: MotionValue<number>;
  selected: boolean;
  onPick: () => void;
}) {
  const y = useTransform(offset, (at) => (index - at) * PITCH);

  return (
    <motion.div
      style={{ y }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <button
        type="button"
        role="option"
        aria-selected={selected}
        aria-label={agent.name}
        onClick={onPick}
        className="pointer-events-auto cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/50"
      >
        <Avatar agent={agent} />
      </button>
    </motion.div>
  );
}

function HandoffPicker({
  agents,
  value,
  defaultValue,
  onChange,
  open,
  defaultOpen = false,
  onOpenChange,
  label = "Handoff to",
  visibleCount = 2,
  disabled = false,
  className,
  ...props
}: HandoffPickerProps) {
  const last = agents.length - 1;
  const reduced = useReducedMotion();
  const listId = useId();

  const controlledOpen = open !== undefined;
  const [openState, setOpenState] = useState(defaultOpen);
  const isOpen = controlledOpen ? open : openState;

  const controlled = value !== undefined;
  const [pick, setPick] = useState(() => {
    const start = agents.findIndex((a) => a.id === (value ?? defaultValue));
    return start < 0 ? 0 : start;
  });
  const index = controlled
    ? Math.max(
        0,
        agents.findIndex((a) => a.id === value),
      )
    : pick;

  const offset = useMotionValue(index);
  const velocity = useVelocity(offset);
  // the banded position, so a drag that overshoots the ends unwinds from where it actually sits
  const raw = useRef(index);
  const column = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startY = useRef(0);
  const lastY = useRef(0);
  const [slotLeft, setSlotLeft] = useState<number | null>(null);

  // the column has to land exactly on the closed avatar, and the label width decides where that is
  useLayoutEffect(() => {
    const node = slot.current;
    if (!node) return;
    const read = () => setSlotLeft(node.offsetLeft);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    if (node.offsetParent) observer.observe(node.offsetParent);
    return () => observer.disconnect();
  }, []);

  const snap = useRef<ReturnType<typeof animate> | null>(null);
  // bumped whenever a roll is interrupted, so a stale one cannot close the column under a new gesture
  const turn = useRef(0);

  // a snap left running would overwrite every direct write on its next frame, so the gesture takes the value back
  const seize = useCallback(() => {
    turn.current += 1;
    snap.current?.stop();
    snap.current = null;
    if (timer.current) clearTimeout(timer.current);
    raw.current = offset.get();
  }, [offset]);

  const band = useCallback(
    (at: number) => {
      if (at < 0) return -pull(-at);
      if (at > last) return last + pull(at - last);
      return at;
    },
    [last],
  );

  const push = useCallback(
    (by: number) => {
      raw.current = clamp(raw.current + by, -RAW_CAP, last + RAW_CAP);
      offset.set(band(raw.current));
    },
    [band, last, offset],
  );

  // read through a ref so a settled selection does not rebuild the wheel listener mid gesture
  const latest = useRef({ index, agents, onChange });
  useEffect(() => {
    latest.current = { index, agents, onChange };
  });

  const commit = useCallback(
    (next: number) => {
      const target = clamp(next, 0, last);
      raw.current = target;
      snap.current?.stop();
      snap.current = animate(offset, target, reduced ? { duration: 0 } : SNAP);
      if (!controlled) setPick(target);
      const { index: was, agents: list, onChange: notify } = latest.current;
      if (target !== was) notify?.(list[target].id);
    },
    [controlled, last, offset, reduced],
  );

  const settle = useCallback(() => {
    const projected = raw.current + velocity.get() * THROW;
    commit(Math.round(clamp(projected, -0.5, last + 0.5)));
  }, [commit, last, velocity]);

  // a controlled value that changes from outside still has to move the column
  useEffect(() => {
    if (!controlled) return;
    raw.current = index;
    snap.current?.stop();
    snap.current = animate(offset, index, reduced ? { duration: 0 } : SNAP);
  }, [controlled, index, offset, reduced]);

  useEffect(() => {
    const node = column.current;
    if (!node || !isOpen) return;

    const onWheel = (event: WheelEvent) => {
      // the column owns the gesture while it is open, otherwise the page scrolls out from under it
      event.preventDefault();
      if (snap.current) seize();
      // firefox reports wheel deltas in lines, which would otherwise crawl
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      push(delta / PITCH);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(settle, SETTLE);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", onWheel);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isOpen, push, seize, settle]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!controlledOpen) setOpenState(next);
      onOpenChange?.(next);
    },
    [controlledOpen, disabled, onOpenChange],
  );

  // a click outside keeps whatever is centred rather than reverting it
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (event: PointerEvent) => {
      const root = column.current?.closest("[data-slot='handoff-picker']");
      if (root && !root.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isOpen, setOpen]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging.current = true;
    moved.current = false;
    startY.current = event.clientY;
    lastY.current = event.clientY;
    seize();
  };

  // movementY is unreliable under touch, so the delta comes off the tracked position
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    if (!moved.current) {
      if (Math.abs(event.clientY - startY.current) <= SLOP) return;
      moved.current = true;
      // captured only once this is really a drag; capturing on pointerdown retargets the
      // pointerup to the column and the click never reaches the agent underneath
      event.currentTarget.setPointerCapture(event.pointerId);
      lastY.current = event.clientY;
    }
    push(-(event.clientY - lastY.current) / PITCH);
    lastY.current = event.clientY;
  };

  // a click lands here too, and settling it would fire onChange for the agent the click is replacing
  const onPointerUp = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (!moved.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    settle();
  };

  // clicking an agent picks it, and the column closes once the roll lands rather than on a guessed delay
  const choose = (target: number) => {
    if (target === index) return setOpen(false);
    const mine = turn.current + 1;
    turn.current = mine;
    commit(target);
    const roll = snap.current;
    if (!roll) return setOpen(false);
    roll.finished
      .then(() => {
        if (turn.current === mine) setOpen(false);
      })
      .catch(() => {});
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") return setOpen(false);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) return setOpen(true);
      commit(index + (event.key === "ArrowDown" ? 1 : -1));
    }
  };

  const height = PITCH * (visibleCount * 2 + 1);

  return (
    <div
      data-slot="handoff-picker"
      data-open={isOpen || undefined}
      data-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex h-12 items-center rounded-[14px] bg-[#F4F4F9] font-runde text-black shadow-[0_6px_20px_-8px_rgba(0,0,0,0.3)] dark:bg-[#262626] dark:text-white",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        data-slot="handoff-picker-trigger"
        onClick={() => setOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        className="flex h-full cursor-pointer items-center gap-2.5 rounded-l-[14px] pl-4 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/30 dark:focus-visible:ring-white/40"
      >
        <span className="text-[15px] font-semibold">{label}</span>
        <span
          ref={slot}
          aria-hidden
          style={{ width: AVATAR, height: AVATAR }}
          className="shrink-0"
        >
          {/* the open column renders the centred agent in this exact spot, so the static one steps aside */}
          {!isOpen && <Avatar agent={agents[index]} />}
        </span>
      </button>

      <span className="h-5 w-px shrink-0 bg-black/[0.09] dark:bg-white/[0.12]" />

      <button
        type="button"
        data-slot="handoff-picker-toggle"
        onClick={() => setOpen(!isOpen)}
        disabled={disabled}
        aria-label={isOpen ? "Close agent list" : "Open agent list"}
        tabIndex={-1}
        className="flex h-full w-11 cursor-pointer items-center justify-center rounded-r-[14px] text-[#75747f] outline-none transition-colors hover:text-[#4a4953] active:scale-90 disabled:active:scale-100 dark:text-[#a3a2ae] dark:hover:text-white"
      >
        <Chevron open={!!isOpen} />
      </button>

      {isOpen && slotLeft !== null && (
        <div
          ref={column}
          id={listId}
          role="listbox"
          data-slot="handoff-picker-list"
          aria-label={label}
          tabIndex={-1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            height,
            width: AVATAR,
            top: `calc(50% - ${height / 2}px)`,
            left: slotLeft,
            touchAction: "none",
          }}
          className="absolute z-10 flex cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
        >
          {agents.map((agent, i) => (
            <Option
              key={agent.id}
              agent={agent}
              index={i}
              offset={offset}
              selected={i === index}
              onPick={() => choose(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { HandoffPicker };
export default HandoffPicker;
