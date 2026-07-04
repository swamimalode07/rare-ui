"use client";

import { useRef } from "react";
import FluidOrb from "@/components/ui/fluid-orb";
import ColorSwatches from "@/components/preview/ColorSwatches";
import { usePreviewControl } from "@/components/preview/PreviewControls";

export default function FluidOrbPage() {
  const [color] = usePreviewControl("color", "#1A73F2");
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full items-center justify-center"
    >
      <FluidOrb size={200} color={color} />

      <ColorSwatches
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      />
    </div>
  );
}
