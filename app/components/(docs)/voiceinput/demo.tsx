"use client";

import { motion, useReducedMotion } from "motion/react";
import { Squircle } from "@squircle-js/react";
import VoiceInput, { type VoiceState } from "@/components/ui/voice-input";
import { usePreviewControl } from "@/components/preview/PreviewControls";

const SQUIRCLE = { cornerRadius: 18, cornerSmoothing: 5 } as const;
const STATES: VoiceState[] = ["idle", "listening", "thinking"];

export default function VoiceInputPage() {
  const [state, setState] = usePreviewControl("state", "listening");
  const reduce = useReducedMotion();

  return (
    <div className="relative flex h-full items-center justify-center">
      <VoiceInput state={state as VoiceState} size={200} />

      <Squircle
        {...SQUIRCLE}
        className="border-apple absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-1 bg-muted p-1.5 shadow-xl backdrop-blur"
      >
        {STATES.map((option) => {
          const selected = state === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setState(option)}
              aria-pressed={selected}
              className="relative h-8 cursor-pointer rounded-xl px-3.5 text-xs font-medium capitalize outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
            >
              {selected && (
                <motion.span
                  layoutId="voice-state-pill"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                  className="absolute inset-0 rounded-xl bg-background shadow-sm"
                />
              )}
              <span
                className={`relative transition-colors duration-200 ${
                  selected ? "text-foreground" : "text-foreground/50"
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </Squircle>
    </div>
  );
}
