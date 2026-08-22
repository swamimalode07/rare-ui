"use client";

import { useState } from "react";
import { StepPlayer } from "@/components/ui/step-player";

export default function StepPlayerPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      <StepPlayer
        steps={5}
        value={step}
        onValueChange={setStep}
        duration={3000}
        size={60}
        seekable
      />

      <p className="text-sm text-[#868593] dark:text-[#9B9AA7]">
        Step {step + 1} of 5
      </p>
    </div>
  );
}
