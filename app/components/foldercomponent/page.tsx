"use client";

import { useRef } from "react";
import FolderComponent from "@/components/ui/folder-component";
import ColorSwatches from "@/components/preview/ColorSwatches";
import { usePreviewControl } from "@/components/preview/PreviewControls";

export default function FolderComponentPage() {
  const [color] = usePreviewControl("color", "black");
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full items-center justify-center"
    >
      <FolderComponent
        color={color as "black" | "white" | "blue"}
        size="md"
      />

      <ColorSwatches
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      />
    </div>
  );
}
