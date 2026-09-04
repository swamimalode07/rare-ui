'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export type VoiceState = 'idle' | 'listening' | 'thinking'

export type VoiceInputProps = React.ComponentProps<'div'> & {
  state?: VoiceState
  level?: number
  size?: number
  color?: string
  dots?: number
  labels?: Partial<Record<VoiceState, string>>
}

const TAU = Math.PI * 2

const STATE_KEYS: VoiceState[] = ['idle', 'listening', 'thinking']

const STATUS_LABEL: Record<VoiceState, string> = {
  idle: 'Idle',
  listening: 'Listening',
  thinking: 'Thinking',
}

const STATE_SCALE: Record<VoiceState, number> = {
  idle: 0.88,
  listening: 1,
  thinking: 0.92,
}

const STIFFNESS = 180
const DAMPING = 26
const ATTACK = 0.35
const RELEASE = 0.08
const BLEND = 0.16
const STATIC_LEVEL = 0.6

const DEFAULT_COLOR = '#F75001'

function clamp(n: unknown, min: number, max: number, fallback: number) {
  return typeof n === 'number' && Number.isFinite(n)
    ? Math.min(max, Math.max(min, n))
    : fallback
}

// stands in for a real amplitude when no level prop is supplied
function syntheticLevel(state: VoiceState, t: number) {
  if (state !== 'listening') return 0
  return 0.18 + 0.82 * Math.abs(Math.sin(t * 2.1) * Math.sin(t * 0.83 + 0.6))
}

function stateIntensity(
  state: VoiceState,
  d: number,
  nx: number,
  ny: number,
  t: number,
  amplitude: number,
) {
  if (state === 'listening') {
    const ripple = 0.5 + 0.5 * Math.sin(d * 5 - t * 5)
    return 0.32 + amplitude * (0.28 + 0.52 * ripple)
  }
  if (state === 'thinking') {
    let a = (Math.atan2(ny, nx) - t * 2.4) % TAU
    if (a < 0) a += TAU
    // the center has no meaningful angle, so hold it steady there
    const arm = Math.min(1, d / 0.4)
    const comet = Math.pow(1 - a / TAU, 2.2)
    return 0.3 + 0.6 * (comet * arm + 0.45 * (1 - arm))
  }
  return 0.62 + 0.12 * Math.sin(t * 1.05 - d * 2.4)
}

const VoiceInput = ({
  state = 'idle',
  level,
  size = 240,
  color = DEFAULT_COLOR,
  dots = 11,
  labels,
  className,
  ...props
}: VoiceInputProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)
  const levelRef = useRef(level)
  const staticDrawRef = useRef<(() => void) | null>(null)

  const px = clamp(size, 1, 4096, 240)

  const scaleFor = (s: VoiceState) => STATE_SCALE[s] ?? STATE_SCALE.idle

  // a non-finite level would otherwise poison the loop for good
  const resolveLevel = (s: VoiceState, t: number, fallback?: number) =>
    levelRef.current === undefined
      ? fallback ?? syntheticLevel(s, t)
      : clamp(levelRef.current, 0, 1, fallback ?? syntheticLevel(s, t))

  useEffect(() => {
    stateRef.current = state
    levelRef.current = level
  }, [state, level])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(px * dpr)
    canvas.height = Math.round(px * dpr)
    ctx.scale(dpr, dpr)

    // an invalid color leaves fillStyle on the default rather than falling back to black
    ctx.fillStyle = DEFAULT_COLOR
    ctx.fillStyle = color

    const grid = Math.round(clamp(dots, 3, 64, 11))
    const half = (grid - 1) / 2
    const spacing = (px * 0.74) / (grid - 1)
    const maxRadius = spacing * 0.5
    const center = px / 2

    const draw = (
      t: number,
      amplitude: number,
      scale: number,
      weights: Record<VoiceState, number>,
    ) => {
      ctx.clearRect(0, 0, px, px)

      for (let iy = 0; iy < grid; iy++) {
        for (let ix = 0; ix < grid; ix++) {
          const nx = (ix - half) / half
          const ny = (iy - half) / half
          const d = Math.hypot(nx, ny)
          if (d > 1.4) continue

          let weighted = 0
          let total = 0
          for (const s of STATE_KEYS) {
            const w = weights[s]
            if (w < 0.001) continue
            weighted += w * stateIntensity(s, d, nx, ny, t, amplitude)
            total += w
          }

          const intensity = Math.max(0, Math.min(1, total > 0 ? weighted / total : 0))
          const falloff = Math.exp(-d * d * 1.7)
          const radius = maxRadius * falloff * intensity * scale
          if (radius < 0.12) continue

          ctx.globalAlpha = 0.25 + 0.75 * intensity
          ctx.beginPath()
          ctx.arc(
            center + (ix - half) * spacing * scale,
            center + (iy - half) * spacing * scale,
            radius,
            0,
            TAU,
          )
          ctx.fill()
        }
      }
    }

    const settled = (s: VoiceState) =>
      ({
        idle: s === 'idle' ? 1 : 0,
        listening: s === 'listening' ? 1 : 0,
        thinking: s === 'thinking' ? 1 : 0,
      }) as Record<VoiceState, number>

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      staticDrawRef.current = () => {
        const current = stateRef.current
        draw(0, resolveLevel(current, 0, STATIC_LEVEL), scaleFor(current), settled(current))
      }
      staticDrawRef.current()
      return () => {
        staticDrawRef.current = null
      }
    }

    let t = 0
    let amplitude = 0
    let scale = scaleFor(state)
    let velocity = 0
    let last = performance.now()
    let raf = 0
    const weights = settled(state)

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt

      const current = stateRef.current
      const target = resolveLevel(current, t)
      const rate = target > amplitude ? ATTACK : RELEASE
      amplitude += (target - amplitude) * (1 - Math.pow(1 - rate, dt * 60))

      // each state carries its own weight, so interrupting a change blends
      // from whatever is on screen instead of snapping to a new pair
      const step = 1 - Math.pow(1 - BLEND, dt * 60)
      for (const s of STATE_KEYS) {
        weights[s] += ((s === current ? 1 : 0) - weights[s]) * step
      }

      velocity +=
        (-STIFFNESS * (scale - scaleFor(current)) - DAMPING * velocity) * dt
      scale += velocity * dt

      draw(t, amplitude, scale, weights)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(raf)
    // state is read through a ref so the loop retargets instead of restarting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px, color, dots])

  useEffect(() => {
    staticDrawRef.current?.()
  }, [state, level])

  return (
    <div
      data-slot="voice-input"
      data-state={state}
      className={cn('flex flex-col items-center gap-3', className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="block"
        style={{ width: px, height: px }}
      />
      <span role="status" aria-live="polite" className="text-sm text-foreground/70">
        {labels?.[state] ?? STATUS_LABEL[state] ?? STATUS_LABEL.idle}
      </span>
    </div>
  )
}

export default VoiceInput
