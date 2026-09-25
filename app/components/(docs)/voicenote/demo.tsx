"use client";

import { useRef } from "react";
import { VoiceNote } from "@/components/ui/voice-note";
import ColorSwatches from "@/components/preview/ColorSwatches";
import { usePreviewControl } from "@/components/preview/PreviewControls";

export default function VoiceNotePage() {
  const [accent] = usePreviewControl("accent", "#FC4C01");
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full items-center justify-center p-6"
    >
      <VoiceNote accent={accent} className="w-[340px]" />

      <ColorSwatches
        draggable
        constraintsRef={previewRef}
        className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      />
    </div>
  );
}
