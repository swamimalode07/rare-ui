"use client";

import { useMemo, useState } from "react";
import AnimatedCounter from "@/components/ui/animated-counter";

const MAX = 150_000;
const ROLL = 0.5;
const TICKS = 41;
const ACCENT = "#FC4C01";

export default function AnimatedCounterPage() {
  const [value, setValue] = useState(12_480);
  const marker = Math.round((value / MAX) * (TICKS - 1));

  // the ruler only changes when the dash crosses a tick, not on every pixel of the drag
  const ticks = useMemo(
    () =>
      Array.from({ length: TICKS }, (_, index) =>
        // the dash is a tick rather than an overlay, so it lands dead on one
        index === marker ? (
          <span
            key={index}
            style={{ backgroundColor: ACCENT }}
            className="-mx-[0.5px] h-7 w-[3px] rounded-full"
          />
        ) : (
          <span
            key={index}
            className={`w-0.5 rounded-full transition-[height,background-color] duration-200 motion-reduce:transition-none ${
              index < marker
                ? "h-5 bg-[#3C3C43] dark:bg-[#EBEBF5]"
                : "h-3.5 bg-[#E7E7EF] dark:bg-[#3C3C43]"
            }`}
          />
        ),
      ),
    [marker],
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-14 p-6">
      <AnimatedCounter
        value={value}
        duration={ROLL}
        grouping="indian"
        prefix={<span className="mr-0.5">$</span>}
        // a mono comma sits in a full character advance, so pull the gaps back in
        className="font-mono text-6xl font-medium tracking-tight text-foreground [&_[data-slot=animated-counter-mark]]:-mx-[0.1em] sm:text-7xl"
      />

      <div className="relative w-full max-w-sm rounded-xl px-px has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-[#868593]">
        <div aria-hidden className="flex h-8 items-end justify-between">
          {ticks}
        </div>

        <input
          type="range"
          min={0}
          max={MAX}
          step={1}
          value={value}
          aria-label="Counter value"
          onChange={(event) => setValue(event.target.valueAsNumber)}
          className="absolute inset-0 h-full w-full cursor-grab appearance-none bg-transparent opacity-0 outline-none active:cursor-grabbing"
        />
      </div>
    </div>
  );
}
