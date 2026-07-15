"use client";

import { useRef } from "react";
import CodeBlock from "@/components/ui/code-block";
import ColorSwatches from "@/components/preview/ColorSwatches";
import { usePreviewControl } from "@/components/preview/PreviewControls";

const SAMPLE = `import { useSpring, animated } from "motion/react";

type OrbitProps = {
  radius?: number;
  speed?: number;
};

export function Orbit({ radius = 120, speed = 1 }: OrbitProps) {
  const angle = useSpring(0, { stiffness: 80, damping: 20 });

  const x = Math.cos(angle.get()) * radius;
  const y = Math.sin(angle.get()) * radius;

  return (
    <animated.div
      style={{ x, y }}
      className="size-4 rounded-full bg-current"
    />
  );
}`;

export default function CodeBlockPage() {
  const [accent] = usePreviewControl("accent", "#F75001");
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full items-center justify-center px-4"
    >
      <CodeBlock
        code={SAMPLE}
        language="tsx"
        accent={accent}
        filename="orbit.tsx"
        showFrame={false}
        className="max-h-[70vh] w-full max-w-xl"
      />

      <ColorSwatches
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      />
    </div>
  );
}
