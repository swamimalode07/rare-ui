"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const PATTERNS = {
  numbers: /^[0-9]$/,
  letters: /^[a-zA-Z]$/,
  both: /^[a-zA-Z0-9]$/,
} as const;

// success draws its own ring in svg, so no css ring here
const RING = {
  idle: "focus-visible:ring-2 focus-visible:ring-[#868593]/50",
  success: "",
  error: "ring-2 ring-[#FF3B30]/70 delay-150",
} as const;

const SUCCESS = "#34C759";

const SIZES = {
  sm: {
    box: "size-10 rounded-lg",
    row: "h-10",
    rowRem: 2.5,
    clip: "rounded-lg",
    text: "text-base",
    caret: "h-5",
    gap: "gap-1.5",
    px: 40,
    radius: 8,
  },
  md: {
    box: "size-12 rounded-xl",
    row: "h-12",
    rowRem: 3,
    clip: "rounded-xl",
    text: "text-lg",
    caret: "h-6",
    gap: "gap-2",
    px: 48,
    radius: 12,
  },
  lg: {
    box: "size-14 rounded-2xl",
    row: "h-14",
    rowRem: 3.5,
    clip: "rounded-2xl",
    text: "text-xl",
    caret: "h-7",
    gap: "gap-2.5",
    px: 56,
    radius: 16,
  },
} as const;

const SLOT_CLASS =
  "bg-[#F4F4F9] dark:bg-[#262626] text-center font-medium text-transparent caret-transparent outline-none transition-shadow duration-200 selection:bg-transparent selection:text-transparent disabled:cursor-not-allowed disabled:opacity-50";

const ROLL_SPRING = { type: "spring", stiffness: 500, damping: 34 } as const;
const ROLL_MS = 280;
const CARET_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;
const BLINK = {
  duration: 1.1,
  times: [0, 0.5, 0.5, 1],
  repeat: Infinity,
  ease: "linear" as const,
};

const ROLL = {
  initial: { y: "110%" },
  exit: (cleared: boolean) => ({ y: cleared ? "110%" : "-110%" }),
};

const SHAKE = [0, -5, 4, -2, 0];

const toSlots = (code: string, length: number) =>
  Array.from({ length }, (_, i) => code[i] ?? "");

export type OtpStatus = "idle" | "success" | "error";

export type OtpInputProps = Omit<
  ComponentProps<"div">,
  "onChange" | "value" | "defaultValue"
> & {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: keyof typeof PATTERNS;
  size?: keyof typeof SIZES;
  status?: OtpStatus;
  mask?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  duration?: number;
  dial?: boolean;
  slotClassName?: string;
};

const DIAL_DIGITS = [
  "",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;
const DIAL_DURATION = 800;
const DIAL_EASE = [0.45, 0, 0.15, 1] as const;
const DIAL_MASK =
  "linear-gradient(to bottom, transparent 0%, white 22%, white 78%, transparent 100%)";

function dialIndex(char: string) {
  return char >= "0" && char <= "9" ? Number(char) + 1 : 0;
}

function dialSeconds(index: number, durationMs: number) {
  const max = DIAL_DIGITS.length - 1;
  return (durationMs / 1000) * (0.4 + 0.6 * (index / max));
}

function entryMs(
  char: string,
  duration: number,
  reduceMotion: boolean,
  useDial: boolean,
) {
  if (!char || reduceMotion) return 0;
  if (useDial && /^[0-9]$/.test(char)) {
    return Math.round(dialSeconds(dialIndex(char), duration) * 1000);
  }
  return ROLL_MS;
}

function DigitDial({
  char,
  className,
  duration,
  reduceMotion,
  rowClass,
  rowRem,
}: {
  char: string;
  className: string;
  duration: number;
  reduceMotion: boolean;
  rowClass: string;
  rowRem: number;
}) {
  const index = dialIndex(char);

  return (
    <span
      aria-hidden
      data-slot="otp-input-char"
      className="absolute inset-0 overflow-hidden"
    >
      <span
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: DIAL_MASK,
          WebkitMaskImage: DIAL_MASK,
        }}
      >
        <motion.span
          className={cn(
            "flex w-full flex-col items-center tabular-nums",
            className,
          )}
          initial={false}
          animate={{ y: `${-index * rowRem}rem` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: dialSeconds(index, duration), ease: DIAL_EASE }
          }
        >
          {DIAL_DIGITS.map((digit, i) => (
            <span
              key={i}
              className={cn(
                "flex w-full shrink-0 items-center justify-center leading-none",
                rowClass,
              )}
            >
              {digit}
            </span>
          ))}
        </motion.span>
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38%] [mask-image:linear-gradient(to_bottom,black,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] backdrop-blur-[0.75px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] [mask-image:linear-gradient(to_top,black,transparent)] [-webkit-mask-image:linear-gradient(to_top,black,transparent)] backdrop-blur-[0.75px]"
      />
    </span>
  );
}

export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  type = "numbers",
  size = "md",
  status = "idle",
  mask = false,
  disabled,
  autoFocus,
  duration = DIAL_DURATION,
  dial = true,
  className,
  slotClassName,
  ...props
}: OtpInputProps) {
  const [uncontrolled, setUncontrolled] = useState(() =>
    toSlots(defaultValue, length),
  );
  const [cleared, setCleared] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [caretX, setCaretX] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // the slot the user deliberately moved to, so a full code only changes on purpose
  const editingAt = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(
    () => () => {
      if (completeTimer.current) clearTimeout(completeTimer.current);
    },
    [],
  );

  // padded, not joined: joining would close a gap left by a mid-code backspace
  const slots =
    value === undefined
      ? Array.from({ length }, (_, i) => uncontrolled[i] ?? "")
      : toSlots(value, length);
  const numeric = type === "numbers";
  const scale = SIZES[size];
  const caretVisible = focused !== null && !slots[focused];

  const commit = (next: string[]) => {
    if (value === undefined) setUncontrolled(next);
    const code = next.join("");
    onChange?.(code);
    if (completeTimer.current) {
      clearTimeout(completeTimer.current);
      completeTimer.current = null;
    }
    if (!next.every(Boolean) || !onComplete) return;
    const useDial = dial && !mask && type !== "letters";
    const delay = Math.max(
      0,
      ...next.map((char, i) =>
        char !== slots[i]
          ? entryMs(char, duration, Boolean(reduceMotion), useDial)
          : 0,
      ),
    );
    if (!delay) {
      onComplete(code);
      return;
    }
    completeTimer.current = setTimeout(() => {
      completeTimer.current = null;
      onComplete(code);
    }, delay);
  };

  const setCharAt = (index: number, char: string) => {
    setCleared(!char);
    commit(slots.map((slot, i) => (i === index ? char : slot)));
  };

  const focusAt = (index: number) => {
    const input = inputs.current[Math.min(Math.max(index, 0), length - 1)];
    input?.focus();
    if (!input?.value) input?.select();
  };

  const fill = (index: number, chars: string[]) => {
    const room = Math.min(chars.length, length - index);
    const next = [...slots];
    chars.slice(0, room).forEach((char, i) => {
      next[index + i] = char;
    });
    setCleared(false);
    commit(next);
    editingAt.current = null;
    focusAt(index + room);
  };

  const handleChange = (index: number, raw: string) => {
    const chars = raw.split("").filter((char) => PATTERNS[type].test(char));
    if (!chars.length) return;

    // typing into a filled slot appends, so keep only the new character
    const typed =
      chars.length === 1
        ? chars[0]
        : chars.length === 2 && chars[0] === slots[index]
          ? chars[1]
          : null;

    if (typed === null) {
      // anything longer arrived at once: a paste or an SMS autofill
      fill(index, chars);
      return;
    }

    if (slots.every(Boolean) && editingAt.current !== index) return;

    setCharAt(index, typed);
    editingAt.current = null;
    if (index + 1 < length) focusAt(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => {
        editingAt.current = Math.max(index - 1, 0);
        focusAt(index - 1);
      },
      ArrowRight: () => {
        editingAt.current = Math.min(index + 1, length - 1);
        focusAt(index + 1);
      },
      Backspace: () => {
        if (slots[index]) {
          setCharAt(index, "");
        } else if (index > 0) {
          setCharAt(index - 1, "");
          focusAt(index - 1);
        }
      },
    };

    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .split("")
      .filter((char) => PATTERNS[type].test(char));
    if (pasted.length) fill(index, pasted);
  };

  // clicking past the first gap lands on the gap, so a code stays contiguous
  const handlePointerDown = (
    index: number,
    event: React.PointerEvent<HTMLInputElement>,
  ) => {
    const firstEmpty = slots.findIndex((slot) => !slot);
    const target = firstEmpty === -1 ? index : Math.min(index, firstEmpty);
    editingAt.current = target;
    if (target === index) return;
    event.preventDefault();
    focusAt(target);
  };

  return (
    <div
      data-slot="otp-input"
      data-status={status}
      className={cn("relative inline-flex", className)}
      {...props}
    >
      <motion.div
        onFocus={(event) => {
          const index = inputs.current.indexOf(
            event.target as HTMLInputElement,
          );
          const cell = cells.current[index];
          setFocused(index);
          if (cell) setCaretX(cell.offsetLeft + cell.offsetWidth / 2);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFocused(null);
          }
        }}
        animate={{
          x: status === "error" && !reduceMotion ? SHAKE : 0,
        }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        data-slot="otp-input-row"
        className={cn("relative flex items-center", scale.gap)}
      >
        {slots.map((slot, index) => {
          const dialing =
            dial &&
            !mask &&
            type !== "letters" &&
            (!slot || /^[0-9]$/.test(slot));

          return (
            <div
              key={index}
              ref={(el) => {
                cells.current[index] = el;
              }}
              data-slot="otp-input-cell"
              data-filled={Boolean(slot)}
              className="relative"
            >
              <input
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                data-slot="otp-input-slot"
                data-filled={Boolean(slot)}
                value={slot}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                onPointerDown={(event) => handlePointerDown(index, event)}
                onFocus={(event) => {
                  if (!event.target.value) event.target.select();
                }}
                type={mask ? "password" : "text"}
                inputMode={numeric ? "numeric" : "text"}
                autoCapitalize={numeric ? undefined : "characters"}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                autoFocus={autoFocus && index === 0}
                disabled={disabled}
                aria-label={`${numeric ? "Digit" : "Character"} ${index + 1} of ${length}`}
                className={cn(
                  SLOT_CLASS,
                  scale.box,
                  scale.text,
                  RING[status],
                  slotClassName,
                )}
              />

              <AnimatePresence>
                {status === "success" && (
                  <motion.svg
                    aria-hidden
                    data-slot="otp-input-ring"
                    viewBox={`0 0 ${scale.px} ${scale.px}`}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute inset-0 size-full"
                  >
                    <motion.rect
                      x={1}
                      y={1}
                      width={scale.px - 2}
                      height={scale.px - 2}
                      rx={scale.radius - 1}
                      fill="none"
                      stroke={SUCCESS}
                      strokeWidth={2}
                      initial={reduceMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 0.45,
                              ease: "easeOut",
                              delay: 0.15 + index * 0.05,
                            }
                      }
                    />
                  </motion.svg>
                )}
              </AnimatePresence>

              <span
                className={cn(
                  "pointer-events-none absolute inset-0 grid place-items-center overflow-hidden",
                  scale.clip,
                )}
              >
                <AnimatePresence initial={false} custom={cleared}>
                  {dialing ? (
                    <DigitDial
                      key="dial"
                      char={slot}
                      duration={duration}
                      reduceMotion={Boolean(reduceMotion)}
                      rowClass={scale.row}
                      rowRem={scale.rowRem}
                      className={cn(
                        "font-semibold text-black dark:text-white",
                        scale.text,
                      )}
                    />
                  ) : (
                    slot && (
                      <motion.span
                        key={slot}
                        custom={cleared}
                        variants={ROLL}
                        initial={reduceMotion ? false : "initial"}
                        animate={{ y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : "exit"}
                        transition={
                          reduceMotion ? { duration: 0 } : ROLL_SPRING
                        }
                        data-slot="otp-input-char"
                        className={cn(
                          "font-semibold text-black dark:text-white",
                          scale.text,
                        )}
                      >
                        {mask ? "•" : slot}
                      </motion.span>
                    )
                  )}
                </AnimatePresence>
              </span>
            </div>
          );
        })}

        {caretVisible && (
          <motion.span
            aria-hidden
            data-slot="otp-input-caret"
            initial={false}
            animate={{ x: caretX - 1, y: "-50%", opacity: [1, 1, 0, 0] }}
            transition={{
              x: reduceMotion ? { duration: 0 } : CARET_SPRING,
              opacity: BLINK,
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 w-0.5 rounded-full bg-black dark:bg-white",
              scale.caret,
            )}
          />
        )}
      </motion.div>
    </div>
  );
}

export default OtpInput;
