"use client";

import { useEffect, useState } from "react";
import ImageReveal from "@/components/ui/image-reveal";

const IMAGE = "/assets/landing/herobg.webp";
const GENERATE_MS = 3600;
const SETTLE_MS = 900;

const BUTTON =
  "grid rounded-full bg-[#F4F4F9] px-4 py-2 text-sm font-medium text-[#4A4959] transition-transform active:scale-95 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100 dark:bg-[#262626] dark:text-[#B4B3BF]";

const LABEL = "col-start-1 row-start-1 transition-opacity duration-200";

export default function ImageRevealPage() {
  const [run, setRun] = useState(0);
  const [src, setSrc] = useState<string | null>(null);
  const [warm, setWarm] = useState(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const a = setTimeout(() => setWarm(true), SETTLE_MS);
    const b = setTimeout(() => setSrc(IMAGE), GENERATE_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [run]);

  const generate = () => {
    if (busy) return;
    setSrc(null);
    setWarm(false);
    setBusy(true);
    setRun((n) => n + 1);
  };

  const caption = src
    ? "Adding detail"
    : warm
      ? "Creating image"
      : "Starting to generate";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="w-[260px]">
        <ImageReveal
          key={run}
          src={src}
          alt="A sky of soft clouds at sunset"
          caption={caption}
          estimatedDuration={GENERATE_MS}
          onRevealComplete={() => setBusy(false)}
        />
      </div>

      <button
        type="button"
        onClick={generate}
        aria-disabled={busy}
        aria-label={busy ? "Generating" : "Generate"}
        className={BUTTON}
      >
        <span
          aria-hidden
          className={`${LABEL} ${busy ? "opacity-0" : "opacity-100"}`}
        >
          Generate
        </span>
        <span
          aria-hidden
          className={`${LABEL} ${busy ? "opacity-100" : "opacity-0"}`}
        >
          Generating
        </span>
      </button>
    </div>
  );
}
