"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GripVertical, RotateCcw, Square } from "lucide-react";
import { Squircle } from "@squircle-js/react";
import { AiStatus } from "@/components/ui/ai-status";
import {
  StreamingResponse,
  type StreamingResponseStatus,
} from "@/components/ui/streaming-response";

const SQUIRCLE = { cornerRadius: 16, cornerSmoothing: 5 } as const;

const QUESTION = "Why do springs feel better than easing curves?";

const ANSWER = `Springs feel natural because they **carry velocity**. Interrupt one mid-flight and it picks up right where it was.

1. Use \`bounce: 0\` for precise UI, like menus.
2. Add a little bounce for *playful* moments.

The [AI Prompt Box](/components/promptbox) uses this for its send button.`;

const THINK_MS = 1400;

// real model streams arrive in uneven bursts; seeded so every replay looks the same
function chunks(text: string) {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out: { at: number; end: number }[] = [];
  let at = 0;
  let end = 0;
  while (end < text.length) {
    end = Math.min(text.length, end + 2 + Math.floor(random() * 14));
    at += random() < 0.12 ? 380 + random() * 320 : 40 + random() * 110;
    out.push({ at, end });
  }
  return out;
}

const CHUNKS = chunks(ANSWER);

type Phase = "thinking" | StreamingResponseStatus;

export default function StreamingResponseDemo() {
  const previewRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("thinking");
  const [received, setReceived] = useState(0);

  useEffect(() => {
    const list = timers.current;
    list.push(window.setTimeout(() => setPhase("streaming"), THINK_MS));
    CHUNKS.forEach(({ at, end }, i) => {
      list.push(
        window.setTimeout(() => {
          setReceived(end);
          if (i === CHUNKS.length - 1) setPhase("done");
        }, THINK_MS + at),
      );
    });
    return () => {
      list.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [run]);

  const replay = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setReceived(0);
    setPhase("thinking");
    setRun((n) => n + 1);
  };

  const stop = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase("stopped");
  };

  const busy = phase === "thinking" || phase === "streaming";

  return (
    <div ref={previewRef} className="relative h-full">
      <div className="flex h-full flex-col overflow-y-auto px-6 pt-16 pb-28 [scrollbar-width:none]">
        {/* min height holds the finished answer, so the centered column never creeps up while it streams */}
        <div className="m-auto flex min-h-[380px] w-[560px] max-w-full flex-col gap-6 font-runde">
          <p className="ml-auto w-fit max-w-[80%] rounded-[20px] bg-[#F4F4F9] px-4 py-2.5 text-[14px] font-medium text-black dark:bg-[#262626] dark:text-white">
            {QUESTION}
          </p>

          <div className="flex flex-col gap-2">
            <AiStatus
              key={`status-${run}`}
              state={
                phase === "thinking"
                  ? "thinking"
                  : phase === "streaming"
                    ? "writing"
                    : phase === "stopped"
                      ? "error"
                      : "done"
              }
              label={phase === "stopped" ? "Stopped" : undefined}
            />
            {phase !== "thinking" && (
              <StreamingResponse
                key={`reply-${run}`}
                text={ANSWER.slice(0, received)}
                status={phase}
                onRetry={replay}
                className="text-black/90 dark:text-white/90"
              />
            )}
          </div>
        </div>
      </div>

      <Squircle asChild {...SQUIRCLE}>
        <motion.div
          drag
          dragConstraints={previewRef}
          dragMomentum={false}
          dragElastic={0}
          whileDrag={{ scale: 1.03 }}
          className="border-apple absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-1 bg-muted p-1 shadow-xl backdrop-blur"
        >
          <span
            className="cursor-grab pr-0.5 pl-1 text-foreground/30 transition-colors hover:text-foreground/60 active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={busy ? stop : replay}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-background px-3.5 text-xs font-medium text-foreground shadow-sm outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            {busy ? (
              <Square className="h-3 w-3 fill-current" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {busy ? "Stop" : "Replay"}
          </button>
        </motion.div>
      </Squircle>
    </div>
  );
}
