"use client";

import { Fragment, useId, useState } from "react";
import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils";

const SEND: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.28 };
const SHIFT: Transition = { type: "spring", visualDuration: 0.4, bounce: 0.1 };
const LEAVE: Transition = { duration: 0.16, ease: [0.4, 0, 1, 1] };
const INSTANT: Transition = { duration: 0 };

const QUESTION = '[data-slot="faq-question"]';
const KEY_STEPS: Record<string, (index: number, last: number) => number> = {
  ArrowDown: (index) => index + 1,
  ArrowUp: (index) => index - 1,
  Home: () => 0,
  End: (_, last) => last,
};

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type BubbleProps = {
  item: FaqItem;
  ids: { question: string; answer: string };
  open: boolean;
  openId: string | null;
  reduced: boolean;
};

function Question({
  item,
  ids,
  open,
  openId,
  reduced,
  onToggle,
}: BubbleProps & { onToggle: () => void }) {
  return (
    <motion.button
      id={ids.question}
      type="button"
      data-slot="faq-question"
      aria-expanded={open}
      aria-controls={open ? ids.answer : undefined}
      onClick={onToggle}
      // every bubble re-measures when any answer opens, so the ones below slide
      layout="position"
      layoutDependency={openId}
      transition={reduced ? INSTANT : SHIFT}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className={cn(
        "max-w-[85%] cursor-pointer self-start rounded-[18px] rounded-bl-none px-4 py-2.5 text-left text-[15px] leading-[1.4] tracking-[-0.01em] text-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#868593]/50 dark:text-white",
        open
          ? "bg-[#E8E8F0] dark:bg-[#333333]"
          : "bg-[#F4F4F9] hover:bg-[#ECECF3] dark:bg-[#262626] dark:hover:bg-[#2D2D2D]",
      )}
    >
      {item.question}
    </motion.button>
  );
}

function Answer({ item, ids, open, openId, reduced }: BubbleProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {open && (
        <motion.div
          key="answer"
          data-slot="faq-answer"
          layout="position"
          layoutDependency={openId}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: reduced ? INSTANT : LEAVE,
          }}
          transition={reduced ? INSTANT : SEND}
          style={{ originX: 1, originY: 1 }}
          className="flex justify-end"
        >
          <div
            id={ids.answer}
            role="region"
            aria-labelledby={ids.question}
            className="max-w-[85%] rounded-[18px] rounded-br-none bg-[var(--faq-accent)] px-4 py-2.5 text-[15px] leading-[1.45] tracking-[-0.01em] text-white"
          >
            {item.answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type FaqProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  items: FaqItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  accent?: string;
};

export function Faq({
  items,
  value,
  defaultValue = null,
  onValueChange,
  accent = "#FC4C01",
  className,
  style,
  ...props
}: FaqProps) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const [own, setOwn] = useState(defaultValue);
  const openId = value === undefined ? own : value;

  const toggle = (id: string) => {
    const next = openId === id ? null : id;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    const target = event.target as HTMLElement;
    if (!step || !target.matches(QUESTION)) return;

    const questions = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(QUESTION),
    ];
    const next = step(questions.indexOf(target), questions.length - 1);
    event.preventDefault();
    questions[(next + questions.length) % questions.length]?.focus();
  };

  return (
    <div
      data-slot="faq"
      onKeyDown={onKeyDown}
      style={{ "--faq-accent": accent, ...style } as CSSProperties}
      className={cn("relative flex w-full max-w-xl flex-col gap-3", className)}
      {...props}
    >
      {items.map((item) => {
        const bubble = {
          item,
          ids: {
            question: `${uid}-${item.id}-question`,
            answer: `${uid}-${item.id}-answer`,
          },
          open: openId === item.id,
          openId,
          reduced,
        };

        return (
          <Fragment key={item.id}>
            <Question {...bubble} onToggle={() => toggle(item.id)} />
            <Answer {...bubble} />
          </Fragment>
        );
      })}
    </div>
  );
}

export default Faq;
