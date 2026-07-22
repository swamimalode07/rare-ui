"use client"

import { useRef, useCallback, useState, useMemo, useEffect } from "react"
import { Minus, Plus } from "lucide-react"

const ROW_HEIGHT = 30
const VISIBLE_ROWS = 7
const FISH_EYE_MAX = 3 // rows above/below that taper

interface VerticalDialProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  formatValue?: (v: number) => string
  onChange: (value: number) => void
  size?: number
}

function smoothstep(edgeDist: number): number {
  const t = Math.max(0, 1 - edgeDist / FISH_EYE_MAX)
  return t * t * (3 - 2 * t)
}

export function VerticalDial({
  label,
  value,
  min,
  max,
  step,
  unit,
  formatValue,
  onChange,
}: VerticalDialProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef(value)
  const lastHapticRef = useRef(value)
  const pointerStartRef = useRef(0)
  const pointerAccumRef = useRef(0)
  const wheelAccumRef = useRef(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  // ── generate all discrete values ────────────────────────────
  const allValues = useMemo(() => {
    const result: number[] = []
    const count = Math.round((max - min) / step)
    for (let i = 0; i <= count; i++) {
      result.push(+(min + i * step).toFixed(10))
    }
    return result
  }, [min, max, step])

  const N = allValues.length
  const currentIndex = allValues.findIndex((v) => Math.abs(v - value) < step / 2)
  const containerHeight = VISIBLE_ROWS * ROW_HEIGHT
  const centerOffset = Math.floor(VISIBLE_ROWS / 2) * ROW_HEIGHT
  const translateY = centerOffset - currentIndex * ROW_HEIGHT

  // auto-scale label density
  const labelInterval = N <= 15 ? 1 : Math.ceil(N / 18)
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)))

  // ── helpers ──────────────────────────────────────────────────
  const snapValue = useCallback(
    (raw: number) => {
      const stepped = Math.round((raw - min) / step) * step + min
      return Math.min(max, Math.max(min, stepped))
    },
    [min, max, step],
  )

  const fireHaptic = useCallback(() => {
    try {
      navigator.vibrate?.(10)
    } catch {
      /* not available */
    }
  }, [])

  const changeBy = useCallback(
    (dir: 1 | -1) => {
      const newVal = snapValue(valueRef.current + dir * step)
      if (newVal !== lastHapticRef.current) {
        lastHapticRef.current = newVal
        onChange(newVal)
        fireHaptic()
      }
    },
    [step, snapValue, onChange, fireHaptic],
  )

  // ── wheel (non-passive) ──────────────────────────────────────
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      wheelAccumRef.current += e.deltaY
      const threshold = ROW_HEIGHT / 2
      while (wheelAccumRef.current >= threshold) {
        changeBy(-1)
        wheelAccumRef.current -= threshold
      }
      while (wheelAccumRef.current <= -threshold) {
        changeBy(1)
        wheelAccumRef.current += threshold
      }
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [changeBy])

  // ── pointer drag ─────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    pointerStartRef.current = e.clientY
    pointerAccumRef.current = 0
    stripRef.current?.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const delta = e.clientY - pointerStartRef.current
      pointerStartRef.current = e.clientY
      pointerAccumRef.current += delta
      const threshold = ROW_HEIGHT / 2
      while (pointerAccumRef.current >= threshold) {
        changeBy(-1)
        pointerAccumRef.current -= threshold
      }
      while (pointerAccumRef.current <= -threshold) {
        changeBy(1)
        pointerAccumRef.current += threshold
      }
    },
    [dragging, changeBy],
  )

  const onPointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  const onPointerCancel = useCallback(() => {
    setDragging(false)
  }, [])

  // ── keyboard ─────────────────────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        changeBy(-1)
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault()
        changeBy(1)
      }
    },
    [changeBy],
  )

  // ── press-and-hold buttons ───────────────────────────────────
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopHold = useCallback(() => {
    if (holdTimeoutRef.current !== null) clearTimeout(holdTimeoutRef.current)
    if (holdIntervalRef.current !== null) clearInterval(holdIntervalRef.current)
    holdTimeoutRef.current = null
    holdIntervalRef.current = null
  }, [])

  const startHold = useCallback(
    (dir: 1 | -1) => {
      const doStep = () => changeBy(dir)
      doStep()
      holdTimeoutRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(doStep, 80)
      }, 400)
    },
    [changeBy],
  )

  const displayed = formatValue ? formatValue(value) : `${value}${unit ?? ""}`

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* header label */}
      <span className="text-[9px] font-medium tracking-[0.18em] text-foreground/25 uppercase">
        {label}
      </span>

      {/* ── dial body ──────────────────────────────────────────── */}
      <div
        ref={stripRef}
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        className="relative touch-none select-none overflow-hidden rounded-xl bg-card outline-none focus-visible:ring-2 focus-visible:ring-[#6cb4ff]/40"
        style={{ width: 90, height: containerHeight }}
      >
        {/* ── center viewfinder marker ────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex items-center justify-center"
          style={{ top: centerOffset }}
        >
          {/* full-width accent line */}
          <div className="absolute inset-x-0 h-px bg-[#6cb4ff]/20" />
          {/* value badge */}
          <div className="relative rounded-md bg-card/80 px-2 py-0.5 shadow-[0_0_12px_rgba(108,180,255,0.18)] backdrop-blur-sm">
            <span className="text-xs font-bold leading-tight text-[#6cb4ff] tabular-nums">
              {displayed}
            </span>
          </div>
        </div>

        {/* ── scrollable tick strip ───────────────────────────── */}
        <div
          style={{
            transform: `translateY(${translateY}px)`,
            transition: dragging
              ? "none"
              : "transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {allValues.map((v, i) => {
            const dist = Math.abs(i - currentIndex)
            const t = smoothstep(dist)
            const isCurrent = i === currentIndex
            const showLabel =
              i % labelInterval === 0 ||
              (dist <= FISH_EYE_MAX && t > 0.25)

            const labelSize = 9 + t * 4
            const labelOpacity = 0.1 + t * 0.9
            const lineH = 1 + t * 2.5
            const lineW = 30 + t * 70
            const lineOpacity = 0.06 + t * 0.94

            return (
              <div
                key={i}
                className="flex items-center px-2"
                style={{ height: ROW_HEIGHT }}
              >
                {/* tick label */}
                <span
                  className="shrink-0 tabular-nums leading-none"
                  style={{
                    width: 32,
                    fontSize: labelSize,
                    fontWeight: t > 0.5 ? 600 : 400,
                    opacity: labelOpacity,
                    color: isCurrent
                      ? "#6cb4ff"
                      : "var(--foreground, rgba(255,255,255,0.9))",
                    textAlign: "right" as const,
                  }}
                >
                  {showLabel ? v.toFixed(decimals) : ""}
                </span>

                {/* tick line */}
                <div className="ml-1.5 flex flex-1 items-center justify-center">
                  <div
                    className="rounded-full"
                    style={{
                      height: lineH,
                      width: `${lineW}%`,
                      opacity: lineOpacity,
                      backgroundColor: isCurrent
                        ? "#6cb4ff"
                        : "rgba(255,255,255,0.4)",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── +/- buttons ────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease"
          onPointerDown={(e) => {
            e.preventDefault()
            startHold(-1)
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            stopHold()
          }}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/35 transition-all duration-150 hover:bg-white/10 hover:text-white/60 active:scale-[0.9] active:shadow-none"
          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
        >
          <Minus size={10} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Increase"
          onPointerDown={(e) => {
            e.preventDefault()
            startHold(1)
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            stopHold()
          }}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/35 transition-all duration-150 hover:bg-white/10 hover:text-white/60 active:scale-[0.9] active:shadow-none"
          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
        >
          <Plus size={10} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
