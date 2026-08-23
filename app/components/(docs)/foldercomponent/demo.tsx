"use client";

import { useRef } from "react";
import {
  GripVertical,
  // Pipette
} from "lucide-react";
import FolderComponent from "@/components/ui/folder-component";
import { usePreviewControl } from "@/components/preview/PreviewControls";
import PreviewDock from "@/components/preview/PreviewDock";
import { useIsMobile } from "@/lib/use-media-query";

const PRESETS = [
  { value: "black", swatch: "#000000" },
  { value: "white", swatch: "#ffffff" },
  { value: "#50B1FD", swatch: "#50B1FD" },
  { value: "#FC4C01", swatch: "#FC4C01" },
] as const;

const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
};

function resolveHex(color: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [, r, g, b] = color;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (NAMED[color]) return NAMED[color];
  if (typeof document === "undefined") return "#000000";
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = "#000000";
  ctx.fillStyle = color;
  const v = String(ctx.fillStyle);
  if (v.startsWith("#")) {
    return v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v;
  }
  const m = v.match(/\d+/g);
  if (!m || m.length < 3) return "#000000";
  return `#${m
    .slice(0, 3)
    .map((n) => Number(n).toString(16).padStart(2, "0"))
    .join("")}`;
}

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 299 + g * 587 + b * 114 > 128000;
}

const swatchClass = (selected: boolean) =>
  `h-7 w-7 cursor-pointer rounded-xl shadow-xl transition-transform duration-150 ${
    selected
      ? "ring-2 ring-neutral-700 ring-offset-1 ring-offset-background"
      : ""
  }`;

export default function FolderComponentPage() {
  const [color, setColor] = usePreviewControl("color", "black");
  const isMobile = useIsMobile();
  const previewRef = useRef<HTMLDivElement>(null);
  const presetSelected = PRESETS.some((p) => p.value === color);
  const pickerHex = resolveHex(color);

  return (
    <div
      ref={previewRef}
      className="relative flex h-full items-center justify-center"
    >
      <FolderComponent color={color} size={isMobile ? "sm" : "md"} />

      <PreviewDock
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      >
        <span
          className="-ml-1 cursor-grab text-foreground/30 transition-colors hover:text-foreground/60 active:cursor-grabbing"
          aria-hidden
        >
          <GripVertical className="h-5 w-5" />
        </span>
        {PRESETS.map((preset) => {
          const selected = color === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => setColor(preset.value)}
              aria-label={`Set color to ${preset.value}`}
              aria-pressed={selected}
              title={preset.value}
              className={swatchClass(selected)}
              style={{ backgroundColor: preset.swatch }}
            />
          );
        })}
        {/* <label
          className={`relative h-7 w-7 cursor-pointer rounded-xl p-0.5 shadow-xl transition-transform duration-150 ${
            presetSelected
              ? ""
              : "ring-2 ring-neutral-700 ring-offset-1 ring-offset-background"
          }`}
          style={{
            background:
              "conic-gradient(from 90deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f87171)",
          }}
          title="Pick any color"
        >
          <span
            className="block h-full w-full rounded-[10px]"
            style={{ backgroundColor: color }}
          />
          <Pipette
            aria-hidden
            className={`pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 ${
              isLight(pickerHex) ? "text-black/80" : "text-white"
            }`}
            strokeWidth={2.25}
          />
          <input
            type="color"
            value={pickerHex}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Pick any color"
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label> */}
      </PreviewDock>
    </div>
  );
}
