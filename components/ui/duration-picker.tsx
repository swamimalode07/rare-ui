'use client'

import { Slot } from '@radix-ui/react-slot'
import { getSvgPath } from 'figma-squircle'
import { interpolate } from 'flubber'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity, type MotionStyle, type MotionValue } from 'motion/react'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'

const PEN_PATH = 'M3.78181 16.3092L3 21L7.69086 20.2182C8.50544 20.0825 9.25725 19.6956 9.84119 19.1116L20.4198 8.53288C21.1934 7.75922 21.1934 6.5049 20.4197 5.73126L18.2687 3.58024C17.495 2.80658 16.2406 2.80659 15.4669 3.58027L4.88841 14.159C4.30447 14.7429 3.91757 15.4947 3.78181 16.3092Z'
const TICK_PATH = 'M7.959 20.513L1.592 12.872L3.128 11.592L8.041 17.487L20.947 3.587L22.413 4.948L7.959 20.513Z'

const OPEN_GAP = 8
const CORNER_RADIUS = 12
const GAP_SPRING = { stiffness: 200, damping: 16, mass: 1 }
const ICON_SPRING = { stiffness: 200, damping: 20 }
const WIDTH_SPRING = { stiffness: 250, damping: 23 }
const SWAY_SPRING = { stiffness: 200, damping: 24 }
const ERROR_SPRING = { stiffness: 700, damping: 9 }

export type DurationValue = {
    hours: number
    minutes: number
}

export type DurationPickerProps = Omit<
    React.ComponentProps<'div'>,
    'onChange' | 'defaultValue' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
> & {
    value?: DurationValue
    defaultValue?: DurationValue
    onChange?: (value: DurationValue) => void
    onConfirm?: (value: DurationValue) => void
    onEditingChange?: (editing: boolean) => void
    defaultEditing?: boolean
    maxHours?: number
    maxMinutes?: number
    hoursLabel?: string
    minutesLabel?: string
    disabled?: boolean
}

type SquircleSegmentProps = {
    asChild?: boolean
    cornerSmoothing?: number
    leftRadius: number | MotionValue<number>
    rightRadius: number | MotionValue<number>
    className?: string
    style?: MotionStyle
    children: React.ReactNode
}

const MotionSlot = motion.create(Slot)

const radiusValue = (radius: number | MotionValue<number>) =>
    typeof radius === 'number' ? radius : radius.get()

const SquircleSegment = ({ asChild, cornerSmoothing = 1, leftRadius, rightRadius, className, style, children }: SquircleSegmentProps) => {
    const Component = asChild ? MotionSlot : motion.div
    const [ref, bounds] = useMeasure()
    const width = useMotionValue(0)
    const height = useMotionValue(0)

    useEffect(() => {
        width.set(bounds.width)
        height.set(bounds.height)
    }, [bounds.width, bounds.height, width, height])

    const clipPath = useTransform(() => {
        const w = width.get()
        const h = height.get()
        if (w <= 0 || h <= 0) {
            return 'none'
        }
        const left = radiusValue(leftRadius)
        const right = radiusValue(rightRadius)
        const path = getSvgPath({
            width: w,
            height: h,
            topLeftCornerRadius: left,
            bottomLeftCornerRadius: left,
            topRightCornerRadius: right,
            bottomRightCornerRadius: right,
            cornerSmoothing,
        })
        return `path('${path}')`
    })

    return (
        <Component data-slot="duration-picker-segment" ref={ref} className={className} style={{ ...style, clipPath }}>
            {children}
        </Component>
    )
}

type DurationFieldProps = {
    value: string
    onValueChange: (value: string) => void
    max: number
    isEditing: boolean
    shouldReduceMotion: boolean
    disabled?: boolean
    swayX: MotionValue<number>
    inputRef?: React.RefObject<HTMLInputElement | null>
}

const DurationField = ({ value, onValueChange, max, isEditing, shouldReduceMotion, disabled, swayX, inputRef }: DurationFieldProps) => {
    const measureRef = useRef<HTMLSpanElement>(null)
    const [textWidth, setTextWidth] = useState(0)
    const errorX = useSpring(0, ERROR_SPRING)
    const x = useTransform(() => swayX.get() + errorX.get())

    useLayoutEffect(() => {
        if (measureRef.current) {
            setTextWidth(measureRef.current.offsetWidth)
        }
    }, [value])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value
        if (next !== '' && (Number(next) > max || Number(next) < 0)) {
            onValueChange(String(Math.min(max, Math.max(0, Number(next)))))
            if (!shouldReduceMotion) {
                errorX.jump(6)
                errorX.set(0)
            }
            return
        }
        onValueChange(next)
    }

    const collapsedWidth = Math.max(textWidth + 12, 22)

    return (
        <>
            <motion.input
                data-slot="duration-picker-input"
                ref={inputRef}
                type="number"
                value={value}
                onChange={handleChange}
                placeholder={isEditing ? '' : '0'}
                readOnly={!isEditing}
                disabled={disabled}
                style={{ x, width: isEditing ? 44 : collapsedWidth }}
                animate={{ width: isEditing ? 44 : collapsedWidth }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', ...WIDTH_SPRING }}
                className='h-full text-center font-semibold text-black dark:text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            />
            <span ref={measureRef} aria-hidden className="invisible absolute whitespace-pre font-semibold">{value || '0'}</span>
        </>
    )
}

const clampField = (raw: number, max: number) => Math.min(max, Math.max(0, Math.trunc(raw) || 0))

function DurationPicker({
    value,
    defaultValue,
    onChange,
    onConfirm,
    onEditingChange,
    defaultEditing = false,
    maxHours = 24,
    maxMinutes = 60,
    hoursLabel = 'Hr.',
    minutesLabel = 'Min.',
    disabled = false,
    className,
    ...props
}: DurationPickerProps) {
    const isControlled = value !== undefined
    const [isEditing, setIsEditing] = useState(defaultEditing)
    const [hoursText, setHoursText] = useState(() => fieldText(value ?? defaultValue, 'hours'))
    const [minutesText, setMinutesText] = useState(() => fieldText(value ?? defaultValue, 'minutes'))

    useEffect(() => {
        if (!isControlled) {
            return
        }
        if (clampField(Number(hoursText), maxHours) !== clampField(value.hours, maxHours)) {
            setHoursText(fieldText(value, 'hours'))
        }
        if (clampField(Number(minutesText), maxMinutes) !== clampField(value.minutes, maxMinutes)) {
            setMinutesText(fieldText(value, 'minutes'))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isControlled, value?.hours, value?.minutes, maxHours, maxMinutes])

    const toValue = (hours: string, minutes: string): DurationValue => ({
        hours: clampField(Number(hours), maxHours),
        minutes: clampField(Number(minutes), maxMinutes),
    })

    const handleHoursChange = (text: string) => {
        setHoursText(text)
        onChange?.(toValue(text, minutesText))
    }

    const handleMinutesChange = (text: string) => {
        setMinutesText(text)
        onChange?.(toValue(hoursText, text))
    }

    const shouldReduceMotion = useReducedMotion()
    const gap = useSpring(defaultEditing ? OPEN_GAP : 0, GAP_SPRING)
    const openness = (v: number) => Math.min(OPEN_GAP, Math.max(0, v)) / OPEN_GAP
    const segmentSpacing = useTransform(gap, (v) => `${Math.min(OPEN_GAP, Math.max(0, v)) - (1 - openness(v))}px`)
    const innerRadius = useTransform(gap, (v) => CORNER_RADIUS * openness(v))
    const innerPadRight = useTransform(gap, (v) => `${3 + 9 * openness(v)}px`)
    const innerPadLeft = useTransform(gap, (v) => `${9 * openness(v)}px`)
    const gapVelocity = useVelocity(gap)
    const scaleX = useTransform(gapVelocity, [-70, 0, 70], [0.93, 1, 1.07], { clamp: true })
    const scaleY = useTransform(scaleX, (v) => 2 - v)
    const swayXRaw = useTransform(gapVelocity, [-70, 0, 70], [-3, 0, 3], { clamp: true })
    const swayX = useSpring(swayXRaw, SWAY_SPRING)
    const iconProgress = useSpring(defaultEditing ? 1 : 0, ICON_SPRING)
    const iconPath = useTransform(iconProgress, [0, 1], [PEN_PATH, TICK_PATH], {
        clamp: true,
        mixer: (from, to) => interpolate(from, to, { maxSegmentLength: 1 }),
    })
    const iconStrokeWidth = useTransform(iconProgress, [0, 1], [0, 1.75], { clamp: true })
    const hoursInputRef = useRef<HTMLInputElement>(null)

    const toggleEdit = () => {
        if (disabled) {
            return
        }
        const next = !isEditing
        const targetGap = next ? OPEN_GAP : 0
        const targetIcon = next ? 1 : 0
        if (shouldReduceMotion) {
            gap.jump(targetGap)
            iconProgress.jump(targetIcon)
        } else {
            gap.set(targetGap)
            iconProgress.set(targetIcon)
        }
        setIsEditing(next)
        onEditingChange?.(next)
        if (next) {
            hoursInputRef.current?.focus()
        } else {
            onConfirm?.(toValue(hoursText, minutesText))
        }
    }

    return (
        <motion.div
            data-slot="duration-picker"
            data-editing={isEditing || undefined}
            data-disabled={disabled || undefined}
            style={{ scaleX, scaleY }}
            className={cn('flex flex-row items-center justify-center text-card-foreground', disabled && 'opacity-50', className)}
            {...props}
        >
            <SquircleSegment leftRadius={CORNER_RADIUS} rightRadius={innerRadius} style={{ paddingRight: innerPadRight }} className="bg-[#F4F4F9] dark:bg-[#262626] h-12 flex items-center gap-1 pl-2">
                <DurationField value={hoursText} onValueChange={handleHoursChange} max={maxHours} isEditing={isEditing} shouldReduceMotion={!!shouldReduceMotion} disabled={disabled} swayX={swayX} inputRef={hoursInputRef} />
                <motion.span style={{ x: swayX }} className='text-[#868593]/70 font-semibold font-runde'>{hoursLabel}</motion.span>
            </SquircleSegment>
            <SquircleSegment leftRadius={innerRadius} rightRadius={innerRadius} style={{ marginLeft: segmentSpacing, paddingLeft: innerPadLeft, paddingRight: innerPadRight }} className="bg-[#F4F4F9] dark:bg-[#262626] h-12 flex items-center gap-1">
                <DurationField value={minutesText} onValueChange={handleMinutesChange} max={maxMinutes} isEditing={isEditing} shouldReduceMotion={!!shouldReduceMotion} disabled={disabled} swayX={swayX} />
                <motion.span style={{ x: swayX }} className='text-[#868593]/70 font-medium font-runde'>{minutesLabel}</motion.span>
            </SquircleSegment>
            <SquircleSegment asChild leftRadius={innerRadius} rightRadius={CORNER_RADIUS} style={{ marginLeft: segmentSpacing }}>
                <button
                    data-slot="duration-picker-toggle"
                    type="button"
                    onClick={toggleEdit}
                    disabled={disabled}
                    aria-label={isEditing ? 'Save duration' : 'Edit duration'}
                    className='w-12 h-12 bg-[#F4F4F9] dark:bg-[#262626] flex justify-center items-center active:scale-90 transition-transform disabled:active:scale-100'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                        <motion.path fill="#868593" stroke="#868593" strokeLinejoin="round" strokeLinecap="round" style={{ strokeWidth: iconStrokeWidth }} d={iconPath} />
                    </svg>
                </button>
            </SquircleSegment>
        </motion.div>
    )
}

function fieldText(value: DurationValue | undefined, field: keyof DurationValue) {
    const n = value?.[field]
    return n === undefined || n === 0 ? '' : String(n)
}

export { DurationPicker }
export default DurationPicker
