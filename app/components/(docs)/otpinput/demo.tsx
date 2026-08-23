"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import OtpInput, { type OtpStatus } from "@/components/ui/otp-input";
import PreviewDock from "@/components/preview/PreviewDock";

const CORRECT_CODE = "123456";
const SWITCH = { type: "spring", bounce: 0, duration: 0.3 } as const;

export default function OtpInputPage() {
  const [status, setStatus] = useState<OtpStatus>("idle");
  const [dial, setDial] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full flex-col items-center justify-center gap-6"
    >
      <OtpInput
        length={6}
        status={status}
        size="md"
        dial={dial}
        onChange={() => setStatus("idle")}
        onComplete={(code) =>
          setStatus(code === CORRECT_CODE ? "success" : "error")
        }
      />
      <p className="text-sm text-foreground/50">
        Enter {CORRECT_CODE} to pass. Any other code fails.
      </p>

      <PreviewDock
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      >
        <span className="mr-0.5 text-xs font-medium text-foreground/55">
          Dial
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={dial}
          aria-label="Digit dial"
          onClick={() => setDial((on) => !on)}
          className={`relative h-6 w-10 shrink-0 rounded-full transition-[background-color,transform] duration-100 ease-out active:scale-[0.97] ${
            dial ? "bg-black dark:bg-white" : "bg-foreground/20"
          }`}
        >
          <motion.span
            aria-hidden
            initial={false}
            animate={{ transform: `translateX(${dial ? 16 : 0}px)` }}
            transition={SWITCH}
            className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white dark:bg-black"
          />
        </button>
      </PreviewDock>
    </div>
  );
}
