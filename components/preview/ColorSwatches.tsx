"use client";

import { usePathname } from "next/navigation";
import { GripVertical } from "lucide-react";
import { activeComponent, cleanDefault, swatchProp } from "@/lib/components";
import { usePreviewControl } from "./PreviewControls";
import PreviewDock from "./PreviewDock";

type ColorSwatchesProps = {
  className?: string;
  showLabel?: boolean;
  draggable?: boolean;
  constraintsRef?: React.RefObject<HTMLElement | null>;
};

export default function ColorSwatches({
  className = "",
  showLabel = false,
  draggable = false,
  constraintsRef,
}: ColorSwatchesProps) {
  const pathname = usePathname();
  const prop = swatchProp(activeComponent(pathname));

  const options = prop?.options ?? [];
  const [value, setValue] = usePreviewControl(
    prop?.name ?? "",
    cleanDefault(prop) ?? options[0] ?? "",
  );

  if (!prop || !prop.optionColors || options.length === 0) return null;

  return (
    <PreviewDock
      draggable={draggable}
      constraintsRef={constraintsRef}
      className={className}
    >
      {draggable && (
        <span
          className="-ml-1 cursor-grab text-foreground/30 transition-colors hover:text-foreground/60 active:cursor-grabbing"
          aria-hidden
        >
          <GripVertical className="h-5 w-5" />
        </span>
      )}
      {showLabel && (
        <span className="mr-0.5 text-xs font-medium text-foreground/55">
          {prop.name}
        </span>
      )}
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setValue(option)}
            aria-label={`Set ${prop.name} to ${option}`}
            aria-pressed={selected}
            title={option}
            className={`h-7 w-7 cursor-pointer rounded-xl shadow-xl transition-transform duration-150  ${
              selected
                ? "ring-2 ring-neutral-700 ring-offset-1 ring-offset-background"
                : ""
            }`}
            style={{ backgroundColor: prop.optionColors![option] }}
          />
        );
      })}
    </PreviewDock>
  );
}
