"use client";

import { useRef } from "react";
import GravityLetters from "@/components/ui/gravity-letters";
import ColorSwatches from "@/components/preview/ColorSwatches";
import { usePreviewControl } from "@/components/preview/PreviewControls";

export default function GravityLettersPage() {
  const [color] = usePreviewControl("color", "currentColor");
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full items-center justify-center px-4"
    >
      <GravityLetters
        color={color}
        type="both"
        className="h-[26rem] w-full max-w-xl rounded-3xl border border-foreground/20 dark:border-foreground/10"
      >
        <div className="pointer-events-none flex h-full items-center justify-center">
          <span className="text-sm font-medium text-foreground/40">
            Click anywhere in the box
          </span>
        </div>
      </GravityLetters>

      <ColorSwatches
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      />
    </div>
  );
}
