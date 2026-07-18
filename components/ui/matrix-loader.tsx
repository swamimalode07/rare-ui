"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const CELL = 16;
const GAP = 3;
const TRAIL = 5;
const DECAY_STEP = 0.14;

export type MatrixPattern =
  | "diagonal"
  | "edge-scan"
  | "ripple"
  | "rain";

export type MatrixLoaderProps = Omit<React.ComponentProps<"div">, "color"> & {
  gridSize?: number;
  color?: string;
  offColor?: string;
  scale?: number;
  fps?: number;
  pattern?: MatrixPattern;
  label?: string;
  labelFont?: string;
  labelColor?: string;
};

/* ---- per-pattern apply function & cycle length ---- */

type PatternApi = {
  cycleLength: number;
  apply: (frame: number, n: number, refs: (SVGRectElement | null)[]) => void;
};

function patternApiFor(p: MatrixPattern, n: number): PatternApi {
  const total = n * n;
  const cx = (n - 1) / 2;
  const cy = (n - 1) / 2;
  // Shuffled columns for rain — deterministic from grid size
  const rainCols = Array.from({ length: n }, (_, i) => i);
  for (let i = rainCols.length - 1; i > 0; i--) {
    const j = Math.floor((n * 7.31 + i * 3.17) % (i + 1)); // seeded shuffle
    [rainCols[i], rainCols[j]] = [rainCols[j], rainCols[i]];
  }

  switch (p) {
    case "diagonal": {
      const maxDiag = (n - 1) * 2;
      const cycleLen = maxDiag + TRAIL;
      return {
        cycleLength: cycleLen,
        apply(frame, n, refs) {
          for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
              const i = r * n + c;
              const el = refs[i];
              if (!el) continue;
              const diag = r + c;
              const dist = (frame - diag + cycleLen) % cycleLen;
              const opacity = dist < TRAIL ? Math.max(1 - dist * DECAY_STEP, 0) : 0;
              el.setAttribute("opacity", opacity.toFixed(3));
            }
          }
        },
      };
    }

    case "edge-scan": {
      const perimeter: number[] = [];
      for (let c = 0; c < n; c++) perimeter.push(0 * n + c);
      for (let r = 1; r < n; r++) perimeter.push(r * n + (n - 1));
      for (let c = n - 2; c >= 0; c--) perimeter.push((n - 1) * n + c);
      for (let r = n - 2; r > 0; r--) perimeter.push(r * n + 0);
      const pLen = perimeter.length;
      const cycleLen = pLen + TRAIL;
      return {
        cycleLength: cycleLen,
        apply(frame, n, refs) {
          for (let i = 0; i < total; i++) {
            const el = refs[i];
            if (el) el.setAttribute("opacity", "0");
          }
          for (let p = 0; p < pLen; p++) {
            const dist = (frame - p + cycleLen) % cycleLen;
            if (dist < TRAIL) {
              const idx = perimeter[p];
              const el = refs[idx];
              if (el) el.setAttribute("opacity", Math.max(1 - dist * DECAY_STEP, 0).toFixed(3));
            }
          }
        },
      };
    }

    case "ripple": {
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const cycleLen = Math.ceil(maxDist * 2) + TRAIL;
      return {
        cycleLength: cycleLen,
        apply(frame, n, refs) {
          for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
              const i = r * n + c;
              const el = refs[i];
              if (!el) continue;
              const d = Math.sqrt((r - cy) * (r - cy) + (c - cx) * (c - cx));
              const dist = (frame - d * 2 + cycleLen) % cycleLen;
              const opacity = dist < TRAIL ? Math.max(1 - dist * DECAY_STEP, 0) : 0;
              el.setAttribute("opacity", opacity.toFixed(3));
            }
          }
        },
      };
    }

    case "rain": {
      const cycleLen = n + TRAIL + 4;
      return {
        cycleLength: cycleLen,
        apply(frame, n, refs) {
          for (let i = 0; i < total; i++) {
            const el = refs[i];
            if (el) el.setAttribute("opacity", "0");
          }
          for (let ci = 0; ci < n; ci++) {
            const col = rainCols[ci % n];
            const dropOffset = ci * 3;
            const dropFrame = (frame - dropOffset + cycleLen) % cycleLen;
            if (dropFrame < n + TRAIL) {
              const row = Math.max(0, dropFrame - 1);
              const idx = Math.min(row, n - 1) * n + col;
              const el = refs[idx];
              if (el) {
                const age = dropFrame - 1;
                const opacity = age < 0 ? 0 : Math.max(1 - age * 0.2, 0);
                el.setAttribute("opacity", opacity.toFixed(3));
              }
            }
          }
        },
      };
    }

    default:
      return { cycleLength: 10, apply: () => {} };
  }
}

/* -------------------------------------------------------------------------- */
/*  MatrixLoader component                                                     */
/* -------------------------------------------------------------------------- */

const MatrixLoader = ({
  gridSize = 5,
  color = "#6cb4ff",
  offColor = "#101B26",
  scale = 0.25,
  fps = 24,
  pattern = "diagonal",
  label,
  labelFont = "Georgia, serif",
  labelColor = "#f0f0f0",
  className,
  ...props
}: MatrixLoaderProps) => {
  const svgSize = gridSize * CELL + (gridSize - 1) * GAP;
  const cellRefs = useRef<(SVGRectElement | null)[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);

  const api = useMemo(() => patternApiFor(pattern, gridSize), [pattern, gridSize]);

  useEffect(() => {
    const frameMs = 1000 / fps;
    const { cycleLength, apply } = api;

    apply(0, gridSize, cellRefs.current);

    const tick = (now: number) => {
      if (now - lastRef.current >= frameMs) {
        lastRef.current = now - ((now - lastRef.current) % frameMs);
        frameRef.current = (frameRef.current + 1) % cycleLength;
        apply(frameRef.current, gridSize, cellRefs.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gridSize, fps, pattern, api]);

  const cells: { x: number; y: number; i: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      cells.push({
        x: c * (CELL + GAP),
        y: r * (CELL + GAP),
        i: r * gridSize + c,
      });
    }
  }

  const loader = (
    <svg
      width={svgSize * scale}
      height={svgSize * scale}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      style={{ overflow: "visible" }}
    >
      <g>
        {cells.map(({ x, y, i }) => (
          <rect
            key={`off-${i}`}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            rx={2}
            fill={offColor}
          />
        ))}
      </g>
      <g style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
        {cells.map(({ x, y, i }) => (
          <rect
            key={`on-${i}`}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            rx={2}
            fill={color}
            opacity={0}
          />
        ))}
      </g>
    </svg>
  );

  if (label) {
    return (
      <div
        data-slot="matrix-loader"
        className={cn(
          "inline-flex items-center gap-5 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        {loader}
        <span
          className="select-none leading-tight"
          style={{
            fontFamily: labelFont,
            color: labelColor,
            fontSize: `${Math.max(16, Math.min(36, 10 + gridSize * 2))}px`,
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      data-slot="matrix-loader"
      className={cn("inline-flex", className)}
      {...props}
    >
      {loader}
    </div>
  );
};

export default MatrixLoader;

export { MatrixLoader };
