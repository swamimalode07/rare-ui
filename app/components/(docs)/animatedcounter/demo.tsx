"use client";

import { useState, type CSSProperties } from "react";
import { Squircle } from "@squircle-js/react";
import AnimatedCounter from "@/components/ui/animated-counter";

const MAX = 150_000;
const ROLL = 0.5;

const SQUIRCLE = { cornerRadius: 16, cornerSmoothing: 5 } as const;

// muted fill up to --fill, recessed past it
const TRACK =
  "[background:linear-gradient(to_right,#868593_0_var(--fill),#E7E7EF_var(--fill)_100%)] dark:[background:linear-gradient(to_right,#868593_0_var(--fill),#262626_var(--fill)_100%)]";

// shaped like a swatch: same soft square and lift the picker uses
const THUMB =
  "[&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-[7px] [&::-webkit-slider-thumb]:bg-[#3C3C43] [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:transition-transform dark:[&::-webkit-slider-thumb]:bg-[#EBEBF5] active:[&::-webkit-slider-thumb]:scale-90 motion-reduce:[&::-webkit-slider-thumb]:transition-none";

const THUMB_MOZ =
  "[&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-[7px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3C3C43] [&::-moz-range-thumb]:shadow-xl dark:[&::-moz-range-thumb]:bg-[#EBEBF5]";

export default function AnimatedCounterPage() {
  const [value, setValue] = useState(12_480);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 p-6">
      <AnimatedCounter
        value={value}
        duration={ROLL}
        grouping="indian"
        prefix={<span className="mr-1">$</span>}
        className="font-mono text-6xl font-medium tracking-tight text-foreground sm:text-7xl"
      />

      <Squircle
        {...SQUIRCLE}
        className="border-apple flex w-full max-w-sm items-center rounded-2xl bg-muted px-4 py-3 shadow-xl backdrop-blur"
      >
        <input
          type="range"
          min={0}
          max={MAX}
          step={1}
          value={value}
          aria-label="Counter value"
          onChange={(event) => setValue(event.target.valueAsNumber)}
          style={{ "--fill": `${(value / MAX) * 100}%` } as CSSProperties}
          className={`h-1.5 w-full cursor-grab appearance-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#868593] active:cursor-grabbing ${TRACK} ${THUMB} ${THUMB_MOZ}`}
        />
      </Squircle>
    </div>
  );
}
