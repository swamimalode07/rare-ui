"use client";

import { useState } from "react";
import AnimatedCounter from "@/components/ui/animated-counter";

const MAX = 250_000;
const ROLL = 0.5;

const THUMB =
  "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-90 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground";

export default function AnimatedCounterPage() {
  const [value, setValue] = useState(12_480);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 p-6">
      <AnimatedCounter
        value={value}
        duration={ROLL}
        grouping="indian"
        prefix={<span className="mr-1 text-foreground/40">$</span>}
        className="font-mono text-6xl font-medium tracking-tight text-foreground sm:text-7xl"
      />

      <div className="w-full max-w-sm">
        <input
          type="range"
          min={0}
          max={MAX}
          step={1}
          value={value}
          aria-label="Counter value"
          onChange={(event) => setValue(event.target.valueAsNumber)}
          className={`h-1.5 w-full cursor-grab appearance-none rounded-full bg-foreground/15 outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-foreground/30 ${THUMB}`}
        />
        <div className="mt-2 flex justify-between font-mono text-xs text-foreground/40">
          <span>0</span>
          <span>2,50,000</span>
        </div>
      </div>
    </div>
  );
}
