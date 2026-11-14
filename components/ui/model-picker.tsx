'use client'

import { Check, ChevronsUpDown, Search } from 'lucide-react'
import {
    AnimatePresence,
    animate,
    motion,
    useReducedMotion,
    type AnimationPlaybackControls,
    type Transition,
    type Variants,
} from 'motion/react'
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export type PickerModel = {
    id: string
    name: string
    provider?: string
    icon?: React.ReactNode
    description?: string
    speed?: number
    intelligence?: number
}

type Phase = 'closed' | 'open' | 'closing'
type Point = { x: number; y: number }

const PANEL_WIDTH = 288
const PANEL_RADIUS = 16
const LIST_MAX_HEIGHT = 320
const EDGE = 8
const METER_STEPS = 5
const ROLL_STAGGER = 0.014

const OPEN: Transition = { type: 'spring', duration: 0.42, bounce: 0.14 }
const CLOSE: Transition = { type: 'spring', duration: 0.36, bounce: 0.06 }
const SLIDE: Transition = { type: 'spring', duration: 0.3, bounce: 0.12 }
// fast and bounceless so the highlight stays under the pointer instead of trailing it
const TRACK: Transition = { type: 'spring', duration: 0.18, bounce: 0 }
const ROLL: Transition = { type: 'spring', duration: 0.42, bounce: 0.1 }
const INSTANT: Transition = { duration: 0 }

const swapVariants: Variants = {
    enter: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
    center: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
}

function RollingText({ text, roll }: { text: string; roll: boolean }) {
    // letters keep their identity by occurrence, so the ones two names share slide into place instead of rolling
    const seen: Record<string, number> = {}
    const letters = [...text].map((char) => {
        seen[char] = (seen[char] ?? 0) + 1
        return { char, key: `${char}${seen[char]}` }
    })

    return (
        <span aria-hidden className="relative inline-flex whitespace-pre">
            <AnimatePresence mode="popLayout" initial={false}>
                {letters.map(({ char, key }, i) => (
                    <motion.span
                        key={key}
                        layout={roll ? 'position' : false}
                        initial={{ opacity: 0, y: '0.7em', filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: '-0.7em', filter: 'blur(3px)', transition: roll ? { duration: 0.12 } : INSTANT }}
                        transition={roll ? { ...ROLL, delay: i * ROLL_STAGGER } : INSTANT}
                    >
                        {char}
                    </motion.span>
                ))}
            </AnimatePresence>
        </span>
    )
}

function Meter({ label, value }: { label: string; value: number }) {
    return (
        <span className="flex items-center gap-2">
            <span>{label}</span>
            <span className="flex items-center gap-[3px]" role="img" aria-label={`${value} of ${METER_STEPS}`}>
                {Array.from({ length: METER_STEPS }, (_, i) => (
                    <span
                        key={i}
                        className={cn(
                            'h-2.5 w-[3px] rounded-full bg-current transition-opacity duration-300',
                            i < value ? 'opacity-80' : 'opacity-15',
                        )}
                        style={{ transitionDelay: `${i * 30}ms` }}
                    />
                ))}
            </span>
        </span>
    )
}

export type ModelPickerProps = Omit<React.ComponentProps<'div'>, 'onChange' | 'defaultValue' | 'children'> & {
    models: PickerModel[]
    value?: string
    defaultValue?: string
    onChange?: (id: string) => void
    searchable?: boolean
}

function ModelPicker({
    models,
    value,
    defaultValue,
    onChange,
    searchable = true,
    className,
    ...props
}: ModelPickerProps) {
    const reduced = !!useReducedMotion()
    const id = useId()
    const listId = `${id}-list`
    const [inner, setInner] = useState(defaultValue ?? models[0]?.id)
    const selectedId = value ?? inner
    const selected = models.find((model) => model.id === selectedId) ?? models[0]

    const [phase, setPhase] = useState<Phase>('closed')
    const [foldTo, setFoldTo] = useState<string | undefined>(undefined)
    const [picked, setPicked] = useState<string | undefined>(undefined)
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)

    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const triggerIconRef = useRef<HTMLSpanElement>(null)
    const surfaceRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const highlightRef = useRef<HTMLDivElement>(null)
    const highlightPlacedRef = useRef(false)
    const placeRef = useRef<Point>({ x: 0, y: 0 })
    const heightRef = useRef(0)
    const runningRef = useRef<AnimationPlaybackControls[]>([])

    const open = phase === 'open'
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return q ? models.filter((model) => `${model.name} ${model.provider ?? ''}`.toLowerCase().includes(q)) : models
    }, [models, query])
    const detailed = models.some((model) => model.description || model.speed || model.intelligence)
    const current = filtered[active]

    const show = () => {
        if (phase !== 'closed') {
            return
        }
        setQuery('')
        setActive(Math.max(0, models.indexOf(selected)))
        setPhase('open')
    }

    // a mouse pick hands focus back without the keyboard ring, a keyboard one keeps it
    const close = (to: string | undefined, refocus: 'keyboard' | 'pointer' | false) => {
        if (phase !== 'open') {
            return
        }
        setFoldTo(to)
        setPhase(reduced ? 'closed' : 'closing')
        if (refocus) {
            triggerRef.current?.focus({ preventScroll: true, focusVisible: refocus === 'keyboard' } as FocusOptions)
        }
    }

    const choose = (model: PickerModel, via: 'keyboard' | 'pointer') => {
        if (value === undefined) {
            setInner(model.id)
        }
        if (model.id !== selectedId) {
            onChange?.(model.id)
        }
        setPicked(model.id)
        close(model.id, via)
    }

    // the panel is laid out in place from the first frame; a pill-shaped window opens around the chosen row and later folds back onto it
    useLayoutEffect(() => {
        const root = rootRef.current
        const trigger = triggerRef.current
        const pillIcon = triggerIconRef.current
        const surface = surfaceRef.current
        const content = contentRef.current
        const list = listRef.current
        if (phase === 'closed' || !root || !trigger || !pillIcon || !surface || !content || !list) {
            return
        }

        const pillWidth = trigger.offsetWidth
        const pillHeight = trigger.offsetHeight
        const height = content.offsetHeight
        const rootRect = root.getBoundingClientRect()
        // screen rects include any zoom or scale above the picker, while offsets and styles are in local pixels
        const scale = rootRect.width / root.offsetWidth || 1

        // the content offset that sits a row's icon and center exactly on the pill's
        const alignTo = (row: Element | null | undefined): Point | null => {
            const icon = row?.querySelector('[data-slot="model-picker-icon"]')
            if (!row || !icon) {
                return null
            }
            const box = content.getBoundingClientRect()
            const rowRect = row.getBoundingClientRect()
            return {
                x: (pillIcon.getBoundingClientRect().left - rootRect.left - (icon.getBoundingClientRect().left - box.left)) / scale,
                y: pillHeight / 2 - (rowRect.top + rowRect.height / 2 - box.top) / scale,
            }
        }
        const pillWindow = (at: Point) => {
            const top = -at.y
            const left = -at.x
            const right = PANEL_WIDTH - left - pillWidth
            const bottom = height - top - pillHeight
            return `inset(${top}px ${right}px ${bottom}px ${left}px round ${pillHeight / 2}px)`
        }
        const fullWindow = `inset(0px 0px 0px 0px round ${PANEL_RADIUS}px)`

        runningRef.current.forEach((control) => control.stop())
        runningRef.current = []

        if (phase === 'open') {
            const row = list.querySelector<HTMLElement>('[aria-selected="true"]')
            if (row && list.scrollHeight > list.clientHeight) {
                list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2
            }
            const aligned = alignTo(row) ?? { x: 0, y: 0 }
            const place = {
                x: Math.max(
                    (EDGE - rootRect.left) / scale,
                    Math.min(aligned.x, (window.innerWidth - EDGE - rootRect.left) / scale - PANEL_WIDTH),
                ),
                y: Math.max(
                    (EDGE - rootRect.top) / scale,
                    Math.min(aligned.y, (window.innerHeight - EDGE - rootRect.top) / scale - height),
                ),
            }
            placeRef.current = place
            heightRef.current = height
            content.style.transform = `translateX(${place.x}px) translateY(${place.y}px)`
            ;(searchable ? inputRef.current : list)?.focus({ preventScroll: true })

            if (reduced) {
                content.style.clipPath = fullWindow
                Object.assign(surface.style, {
                    left: `${place.x}px`,
                    top: `${place.y}px`,
                    width: `${PANEL_WIDTH}px`,
                    height: `${height}px`,
                    borderRadius: `${PANEL_RADIUS}px`,
                    opacity: '1',
                })
                return
            }
            content.style.clipPath = pillWindow(place)
            runningRef.current = [
                animate(content, { clipPath: fullWindow }, OPEN),
                animate(
                    surface,
                    {
                        left: [0, place.x],
                        top: [0, place.y],
                        width: [pillWidth, PANEL_WIDTH],
                        height: [pillHeight, height],
                        borderRadius: [pillHeight / 2, PANEL_RADIUS],
                    },
                    OPEN,
                ),
                animate(surface, { opacity: [0, 1] }, { duration: 0.12 }),
            ]
            return
        }

        // closing: the row being folded into rides back to the pill while everything around it clips away
        const from = placeRef.current
        const row = foldTo ? list.querySelector(`[data-id="${CSS.escape(foldTo)}"]`) : null
        const rowRect = row?.getBoundingClientRect()
        const listRect = list.getBoundingClientRect()
        // a row scrolled out of the list is hidden by its overflow, so folding onto it would end on an empty window
        const visible = rowRect && rowRect.top >= listRect.top - 1 && rowRect.bottom <= listRect.bottom + 1
        const aligned = visible ? alignTo(row) : null
        const to = aligned ?? from
        runningRef.current = [
            animate(content, { x: [from.x, to.x], y: [from.y, to.y], clipPath: pillWindow(to) }, CLOSE),
            animate(content, { opacity: aligned ? 1 : 0 }, { duration: 0.12 }),
            animate(
                surface,
                { left: 0, top: 0, width: pillWidth, height: pillHeight, borderRadius: pillHeight / 2 },
                CLOSE,
            ),
            animate(surface, { opacity: 0 }, { duration: 0.2, delay: 0.1 }),
        ]
        const finish = runningRef.current
        Promise.all(finish.map((control) => control.finished)).then(() => {
            if (runningRef.current === finish) {
                setPhase('closed')
            }
        })
    }, [phase, foldTo, reduced, searchable])

    useEffect(() => () => runningRef.current.forEach((control) => control.stop()), [])

    // filtering changes the panel height, so the surface follows it
    useEffect(() => {
        const content = contentRef.current
        const surface = surfaceRef.current
        if (!open || !content || !surface) {
            return
        }
        const observer = new ResizeObserver(() => {
            const height = content.offsetHeight
            if (height !== heightRef.current) {
                heightRef.current = height
                animate(surface, { height }, reduced ? INSTANT : SLIDE)
            }
        })
        observer.observe(content)
        return () => observer.disconnect()
    }, [open, reduced])

    useEffect(() => {
        if (!open) {
            return
        }
        const outside = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                close(selectedId, false)
            }
        }
        const resize = () => close(selectedId, false)
        document.addEventListener('pointerdown', outside)
        window.addEventListener('resize', resize)
        return () => {
            document.removeEventListener('pointerdown', outside)
            window.removeEventListener('resize', resize)
        }
    })

    // positioned from layout offsets, not screen rects, so zoom or scale above the picker cannot throw it off
    useLayoutEffect(() => {
        const highlight = highlightRef.current
        const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        if (!highlight) {
            highlightPlacedRef.current = false
            return
        }
        if (!row || phase === 'closing') {
            animate(highlight, { opacity: 0 }, reduced ? INSTANT : { duration: 0.15 })
            return
        }
        const target = { y: row.offsetTop, height: row.offsetHeight, opacity: 1 }
        animate(highlight, target, highlightPlacedRef.current && !reduced ? TRACK : INSTANT)
        highlightPlacedRef.current = true
    }, [active, filtered, phase, reduced])

    useEffect(() => {
        const list = listRef.current
        const row = list?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        if (!open || !list || !row) {
            return
        }
        if (row.offsetTop < list.scrollTop) {
            list.scrollTop = row.offsetTop - 6
        } else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight + 6
        }
    }, [active, open])

    const onPanelKey = (event: React.KeyboardEvent) => {
        const count = filtered.length
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (count) {
                setActive((n) => (n + (event.key === 'ArrowDown' ? 1 : -1) + count) % count)
            }
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            setActive(event.key === 'Home' ? 0 : Math.max(0, count - 1))
        } else if (event.key === 'Enter') {
            event.preventDefault()
            if (current) {
                choose(current, 'keyboard')
            }
        } else if (event.key === 'Escape') {
            event.preventDefault()
            close(selectedId, 'keyboard')
        } else if (event.key === 'Tab') {
            close(selectedId, false)
        }
    }

    const onTriggerKey = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            show()
        }
    }

    let index = -1
    const groups: { provider?: string; items: { model: PickerModel; index: number }[] }[] = []
    for (const model of filtered) {
        index += 1
        const last = groups[groups.length - 1]
        if (last && last.provider === model.provider) {
            last.items.push({ model, index })
        } else {
            groups.push({ provider: model.provider, items: [{ model, index }] })
        }
    }

    if (!selected) {
        return null
    }

    // a pick already flies the row into place, so only outside changes to value roll the name
    const roll = !reduced && selected.id !== picked

    return (
        <div ref={rootRef} data-slot="model-picker" className={cn('relative inline-flex', className)} {...props}>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-label={`Model: ${selected.name}`}
                onClick={() => (open ? close(selectedId, 'pointer') : show())}
                onKeyDown={onTriggerKey}
                className={cn(
                    'flex h-8 cursor-pointer items-center gap-2 rounded-full pr-2 pl-2.5 text-[13px] font-medium text-black/90 outline-none transition-colors hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-black/15 dark:text-white/90 dark:hover:bg-white/[0.07] dark:focus-visible:ring-white/25',
                    phase !== 'closed' && 'opacity-0',
                )}
            >
                <span ref={triggerIconRef} className="grid size-4 place-items-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={selected.id}
                            variants={swapVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={roll ? ROLL : INSTANT}
                            className="col-start-1 row-start-1 grid size-4 place-items-center"
                        >
                            {selected.icon}
                        </motion.span>
                    </AnimatePresence>
                </span>
                <RollingText text={selected.name} roll={roll} />
                <motion.span
                    className="grid place-items-center"
                    animate={{ opacity: phase === 'closed' ? 0.45 : 0 }}
                    transition={reduced || phase !== 'closed' ? INSTANT : { duration: 0.25 }}
                >
                    <ChevronsUpDown className="size-3.5" />
                </motion.span>
            </button>

            {phase !== 'closed' && (
                <>
                    <div
                        ref={surfaceRef}
                        aria-hidden
                        className="pointer-events-none absolute top-0 left-0 z-50 border border-black/[0.08] bg-white opacity-0 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] dark:border-white/[0.08] dark:bg-[#1c1c1c] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]"
                    />
                    <div
                        ref={contentRef}
                        data-slot="model-picker-panel"
                        onKeyDown={onPanelKey}
                        className={cn(
                            'absolute top-0 left-0 z-50 flex flex-col [clip-path:inset(50%)]',
                            phase === 'closing' && 'pointer-events-none',
                        )}
                        style={{ width: PANEL_WIDTH }}
                    >
                        {searchable && (
                            <div className="flex h-10 items-center gap-2 border-b border-black/[0.06] px-3.5 text-black/40 dark:border-white/[0.06] dark:text-white/40">
                                <Search className="size-3.5 shrink-0" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value)
                                        setActive(0)
                                    }}
                                    placeholder="Search models"
                                    role="combobox"
                                    aria-expanded={open}
                                    aria-controls={listId}
                                    aria-activedescendant={current ? `${id}-option-${active}` : undefined}
                                    aria-label="Search models"
                                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-black/35 dark:text-white dark:placeholder:text-white/35"
                                />
                            </div>
                        )}

                        <div
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            tabIndex={searchable ? undefined : -1}
                            aria-label="Models"
                            aria-activedescendant={!searchable && current ? `${id}-option-${active}` : undefined}
                            className="relative overflow-y-auto p-1.5 outline-none [scrollbar-width:none]"
                            style={{ maxHeight: LIST_MAX_HEIGHT }}
                        >
                            <div
                                ref={highlightRef}
                                aria-hidden
                                className="pointer-events-none absolute top-0 right-1.5 left-1.5 rounded-[10px] bg-black/[0.05] opacity-0 dark:bg-white/[0.07]"
                            />
                            {groups.map((group, g) => (
                                <div key={`${group.provider ?? ''}-${g}`} role="group" aria-label={group.provider}>
                                    {group.provider && (
                                        <div className="px-2.5 pt-2 pb-1 text-[11px] font-medium text-black/35 dark:text-white/35">
                                            {group.provider}
                                        </div>
                                    )}
                                    {group.items.map(({ model, index: i }) => {
                                        const isSelected = model.id === selected.id
                                        return (
                                            <div
                                                key={model.id}
                                                id={`${id}-option-${i}`}
                                                role="option"
                                                aria-selected={isSelected}
                                                data-id={model.id}
                                                data-index={i}
                                                onPointerMove={() => setActive(i)}
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => choose(model, 'pointer')}
                                                className={cn(
                                                    'relative flex h-9 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors',
                                                    i === active || model.id === foldTo
                                                        ? 'text-black/90 dark:text-white/90'
                                                        : 'text-black/65 dark:text-white/65',
                                                )}
                                            >
                                                <span
                                                    data-slot="model-picker-icon"
                                                    className="relative grid size-4 shrink-0 place-items-center"
                                                >
                                                    {model.icon}
                                                </span>
                                                <span className="relative min-w-0 flex-1 truncate">{model.name}</span>
                                                {isSelected && (
                                                    <Check
                                                        className={cn(
                                                            'relative size-3.5 shrink-0 opacity-60 transition-opacity duration-150',
                                                            phase === 'closing' && 'opacity-0',
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                            {!filtered.length && (
                                <div className="px-2.5 py-6 text-center text-[13px] text-black/40 dark:text-white/40">
                                    No models match
                                </div>
                            )}
                        </div>

                        {detailed && current && (
                            <div className="flex flex-col gap-1.5 border-t border-black/[0.06] px-3.5 py-3 text-[12px] text-black/45 dark:border-white/[0.06] dark:text-white/45">
                                <span className="relative grid">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        <motion.span
                                            key={current.id}
                                            initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
                                            transition={reduced ? INSTANT : SLIDE}
                                            className="col-start-1 row-start-1 truncate text-black/70 dark:text-white/70"
                                        >
                                            {current.description ?? current.name}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                                <span className="flex items-center gap-5">
                                    {current.speed !== undefined && <Meter label="Speed" value={current.speed} />}
                                    {current.intelligence !== undefined && (
                                        <Meter label="Intelligence" value={current.intelligence} />
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export { ModelPicker }
export default ModelPicker
