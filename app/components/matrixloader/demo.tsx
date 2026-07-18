"use client"

import { useRef, useState } from "react"
import { MatrixLoader, type MatrixPattern } from "@/components/ui/matrix-loader"
import { VerticalDial } from "@/components/matrixloader/RadialDial"
import ColorSwatches from "@/components/preview/ColorSwatches"
import { usePreviewControl } from "@/components/preview/PreviewControls"

const PATTERNS: { id: MatrixPattern; label: string }[] = [
  { id: "diagonal", label: "Diagonal" },
  { id: "edge-scan", label: "Edge Scan" },
  { id: "ripple", label: "Ripple" },
  { id: "rain", label: "Rain" },
]

export default function MatrixLoaderPage() {
  const [gridSize, setGridSize] = useState(6)
  const [scale, setScale] = useState(0.25)
  const [fps, setFps] = useState(24)
  const [pattern, setPattern] = useState<MatrixPattern>("diagonal")
  const [label, setLabel] = useState("thinking...")
  const [accentColor] = usePreviewControl("color", "#6cb4ff")
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={previewRef} className="relative flex h-full flex-col items-center justify-center gap-8 p-8">
      {/* ── Hero loader ─────────────────────────────────────────── */}
      <div className="flex min-h-56 min-w-80 items-center justify-center">
        <div style={{ transform: "scale(1.6)", transformOrigin: "center" }}>
          <MatrixLoader
            gridSize={gridSize}
            color={accentColor}
            offColor="#101B26"
            scale={scale}
            fps={fps}
            pattern={pattern}
            label={label}
          />
        </div>
      </div>

      {/* ── Controls bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-center gap-6">
        {/* Pattern buttons — vertical with video on left */}
        <div className="flex flex-col gap-1.5">
          {PATTERNS.map((p) => {
            const active = pattern === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPattern(p.id)}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#6cb4ff]/15 text-[#6cb4ff] shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),0_0_10px_rgba(108,180,255,0.08)] ring-1 ring-[#6cb4ff]/30"
                    : "bg-foreground/5 text-foreground/50 hover:scale-[1.04] hover:bg-foreground/10 hover:text-foreground/75"
                }`}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-black/25">
                  <MatrixLoader
                    gridSize={4}
                    color={accentColor}
                    offColor="#101B26"
                    scale={0.2}
                    fps={18}
                    pattern={p.id}
                    aria-hidden
                  />
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-150 ${
                      active
                        ? "bg-[#6cb4ff] shadow-[0_0_5px_rgba(108,180,255,0.6)]"
                        : "bg-foreground/20"
                    }`}
                  />
                  {p.label}
                </div>
              </button>
            )
          })}
        </div>

        {/* Three dials side by side */}
        <div className="flex flex-row items-start gap-1.5">
          <VerticalDial
            label="SCALE"
            value={scale}
            min={0.05}
            max={0.35}
            step={0.05}
            formatValue={(v) => v.toFixed(2) + "×"}
            onChange={setScale}
          />
          <VerticalDial
            label="GRID"
            value={gridSize}
            min={2}
            max={12}
            step={1}
            formatValue={(v) => `${v}×${v}`}
            onChange={setGridSize}
          />
          <VerticalDial
            label="SPEED"
            value={fps}
            min={4}
            max={60}
            step={1}
            formatValue={(v) => v + " fps"}
            onChange={setFps}
          />
        </div>
      </div>

      {/* ── Color bar ───────────────────────────────────────────── */}
      <ColorSwatches
        draggable
        constraintsRef={previewRef}
        className="absolute bottom-4 inset-x-0 mx-auto w-fit rounded-2xl bg-muted px-4 py-2.5 shadow-xl backdrop-blur"
      />

      {/* ── Label input ─────────────────────────────────────────── */}
      <div className="w-56">
        <div className="space-y-1.5">
          <label className="block text-center text-[10px] font-medium tracking-[0.2em] text-foreground/25 uppercase">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="thinking..."
            className="w-full rounded-xl border border-border/30 bg-black/30 px-3 py-2 text-center text-sm text-foreground outline-none transition-all duration-150 placeholder:text-foreground/15 focus:border-[#6cb4ff]/35 focus:ring-1 focus:ring-[#6cb4ff]/15"
            style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)" }}
          />
        </div>
      </div>
    </div>
  )
}
