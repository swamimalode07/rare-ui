'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

const CARD_W = 280
const CARD_H = 360
const SWIPE_THRESHOLD = 160
const STACK_OFFSET = 6

type Direction = 'down' | 'up' | 'left' | 'right'

const DIRS: { dir: Direction; label: string; arrow: string }[] = [
  { dir: 'up',    label: 'Up',    arrow: '↑' },
  { dir: 'down',  label: 'Down',  arrow: '↓' },
  { dir: 'left',  label: 'Left',  arrow: '←' },
  { dir: 'right', label: 'Right', arrow: '→' },
]

const COLORS = [
  { bg: '#FC4C01' },
  { bg: '#50B1FD' },
  { bg: '#34C759' },
  { bg: '#AF52DE' },
  { bg: '#FF3B30' },
]

const LABELS = [
  'Start your day with intention',
  'Swipe to clear your mind',
  'Each card holds a thought',
  'Let go and watch it settle',
  'Pull hard enough to fly',
]

// How much each card follows the drag — bottom card stays put, top follows fully
const FOLLOW: Record<number, number> = { 0: 0, 1: 0.08, 2: 0.22, 3: 0.50, 4: 1.0 }

export type SpringStackProps = {
  cardCount?: number
  className?: string
}

export function SpringStack({ cardCount = 5, className }: SpringStackProps) {
  const [cards, setCards] = useState(() =>
    Array.from({ length: cardCount }, (_, i) => ({ id: i, label: LABELS[i % LABELS.length] }))
  )
  const [direction, setDirection] = useState<Direction>('down')

  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const smoothX = useSpring(dragX, { stiffness: 300, damping: 30 })
  const smoothY = useSpring(dragY, { stiffness: 300, damping: 30 })

  // Reset drags when card count or direction changes
  const lenRef = useRef(cards.length)
  useEffect(() => {
    if (cards.length !== lenRef.current) {
      dragX.jump(0); dragY.jump(0)
      lenRef.current = cards.length
    }
  }, [cards.length, dragX, dragY])

  useEffect(() => {
    dragX.jump(0); dragY.jump(0)
  }, [direction, dragX, dragY])

  /* ---------- pointer handlers attach to the top card ---------- */

  const startPos = useRef({ x: 0, y: 0 })
  const startDrag = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    startPos.current = { x: e.clientX, y: e.clientY }
    startDrag.current = { x: dragX.get(), y: dragY.get() }
  }, [dragX, dragY])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y

    switch (direction) {
      case 'down':
        dragY.set(Math.max(0, startDrag.current.y + dy))
        break
      case 'up':
        dragY.set(Math.min(0, startDrag.current.y + dy))
        break
      case 'right':
        dragX.set(Math.max(0, startDrag.current.x + dx))
        break
      case 'left':
        dragX.set(Math.min(0, startDrag.current.x + dx))
        break
    }
  }, [direction, dragX, dragY])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    if (!el.hasPointerCapture(e.pointerId)) return
    el.releasePointerCapture(e.pointerId)

    let fired = false
    const v = direction === 'down' || direction === 'right' ? 1 : -1
    const axis = direction === 'down' || direction === 'up' ? 'y' : 'x'
    const val = axis === 'y' ? dragY.get() : dragX.get()

    if (Math.abs(val) > SWIPE_THRESHOLD) {
      const id = cards[cards.length - 1]?.id
      if (id !== undefined) {
        fired = true
        dragX.jump(0); dragY.jump(0)
        setCards(p => p.filter(c => c.id !== id))
      }
    }

    if (!fired) {
      dragX.set(0); dragY.set(0)
    }
  }, [cards, direction, dragX, dragY])

  const reset = useCallback(() => {
    setCards(Array.from({ length: cardCount }, (_, i) => ({ id: i, label: LABELS[i % LABELS.length] })))
  }, [cardCount])

  /* ---------- empty state ---------- */

  if (cards.length === 0) {
    return (
      <div className={cn('relative flex flex-col items-center gap-6', className)}>
        <div style={{ width: CARD_W, height: CARD_H }} className="flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="rounded-xl bg-muted px-5 py-2.5 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            ↻ Reset stack
          </motion.button>
        </div>
        <DirPicker current={direction} onChange={setDirection} />
      </div>
    )
  }

  return (
    <div className={cn('relative flex flex-col items-center gap-6', className)}>
      {/* stack */}
      <div
        className="relative select-none touch-none"
        style={{ width: CARD_W, height: CARD_H + 12 * cards.length }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, i) => {
            const isTop = i === cards.length - 1
            const fromTop = cards.length - 1 - i
            const follow = FOLLOW[i] ?? 0
            const color = COLORS[card.id % COLORS.length]
            const offsetY = fromTop * STACK_OFFSET
            const offsetX = fromTop * 2
            const rotate = fromTop * 0.4

            return (
              <StackCard
                key={card.id}
                card={card}
                isTop={isTop}
                offsetX={offsetX}
                offsetY={offsetY}
                rotate={rotate}
                follow={follow}
                smoothX={smoothX}
                smoothY={smoothY}
                color={color}
                direction={direction}
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerUp : undefined}
              />
            )
          })}
        </AnimatePresence>
      </div>

      {/* direction controls */}
      <DirPicker current={direction} onChange={setDirection} />
    </div>
  )
}

/* ---------- direction toggle ---------- */

function DirPicker({
  current,
  onChange,
}: {
  current: Direction
  onChange: (d: Direction) => void
}) {
  const btn = (dir: Direction, arrow: string, label: string) => (
    <button
      key={dir}
      type="button"
      onClick={() => onChange(dir)}
      aria-pressed={current === dir}
      title={label}
      className={cn(
        'grid size-9 place-items-center rounded-xl text-sm font-medium transition-all duration-150',
        current === dir
          ? 'bg-background text-foreground shadow-sm'
          : 'text-foreground/40 hover:text-foreground/70',
      )}
    >
      {arrow}
    </button>
  )

  return (
    <div className="grid grid-cols-3 gap-1">
      {/*          col-1  col-2  col-3  */}
      {/* row 0              ↑             */}
      {/* row 1       ←      ↓      →      */}
      <div /> {/* spacer top-left */}
      {btn('up', '↑', 'Up')}
      <div /> {/* spacer top-right */}
      {btn('left', '←', 'Left')}
      {btn('down', '↓', 'Down')}
      {btn('right', '→', 'Right')}
    </div>
  )
}

/* ---------- individual card ---------- */

type CardData = { id: number; label: string }

function StackCard({
  card,
  isTop,
  offsetX,
  offsetY,
  rotate,
  follow,
  smoothX,
  smoothY,
  color,
  direction,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  card: CardData
  isTop: boolean
  offsetX: number
  offsetY: number
  rotate: number
  follow: number
  smoothX: ReturnType<typeof useMotionValue<number>>
  smoothY: ReturnType<typeof useMotionValue<number>>
  color: (typeof COLORS)[number]
  direction: Direction
  onPointerDown?: React.PointerEventHandler
  onPointerMove?: React.PointerEventHandler
  onPointerUp?: React.PointerEventHandler
}) {
  const x = useTransform(smoothX, (v) => offsetX + v * follow)
  const y = useTransform(smoothY, (v) => offsetY + v * follow)
  const scale = 1 - offsetY * 0.003

  const exitX =
    direction === 'left' ? -300 : direction === 'right' ? 300 : 0
  const exitY =
    direction === 'up' ? -300 : direction === 'down' ? 300 : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale }}
      exit={{ x: exitX, y: exitY, opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
      className={cn(
        'absolute inset-x-0 overflow-hidden rounded-2xl',
        isTop && 'cursor-grab active:cursor-grabbing',
      )}
      style={{
        x,
        y,
        rotate,
        zIndex: isTop ? 50 : card.id,
        height: CARD_H,
        backgroundColor: color.bg,
        touchAction: 'none',
        boxShadow:
          '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />

      <div className="relative flex h-full flex-col p-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white">
            {card.id + 1}
          </span>
          <span className="text-xs font-medium tracking-wide text-white/50 uppercase">
            Card
          </span>
        </div>

        <div className="mt-auto space-y-2">
          <p className="text-sm leading-relaxed text-white/70">{card.label}</p>

          {isTop && (
            <motion.p
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-xs text-white/40"
            >
              {DIRS.find(d => d.dir === direction)?.arrow} Pull to stretch · release to snap
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
