'use client'

import { Copy } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Highlight, type PrismTheme } from 'prism-react-renderer'
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

const TAP_SPRING = { type: 'spring', stiffness: 500, damping: 30 } as const
const SWAP_SPRING = { type: 'spring', duration: 0.3, bounce: 0 } as const
const CHECK_SPRING = { type: 'spring', duration: 0.4, bounce: 0.35 } as const
const COPY_RESET_MS = 1800

export type CodeBlockProps = Omit<React.ComponentProps<'div'>, 'children'> & {
    /** The source code to render. */
    code: string
    /** Prism language id, e.g. "tsx", "css", "json", "bash". */
    language?: string
    /** Any hex color. The whole theme is built from shades of it. */
    accent?: string
    /** "auto" follows the page theme; pass "dark" or "light" to pin it. */
    mode?: 'auto' | 'dark' | 'light'
    /** Filename or path shown in the header. Falls back to the language id when omitted. */
    filename?: string
    /** Show the outer frame — background, border, rounded corners, and header. Turn off to render just the code. */
    showFrame?: boolean
    /** Show the header bar. Ignored when the frame is off. */
    showHeader?: boolean
    /** Show the line-number gutter. */
    showLineNumbers?: boolean
    /** Show the copy-to-clipboard button. */
    showCopyButton?: boolean
    /** Optional 1-based line numbers to highlight with an accent wash. Off when omitted. */
    highlightLines?: number[]
}
function resolvePageMode(): 'dark' | 'light' {
    const root = document.documentElement
    if (root.classList.contains('dark')) return 'dark'
    if (root.classList.contains('light')) return 'light'
    const attr = root.getAttribute('data-theme')
    if (attr === 'dark') return 'dark'
    if (attr === 'light') return 'light'
    // jsdom has no matchMedia
    if (typeof window.matchMedia !== 'function') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function subscribeToPageMode(onChange: () => void) {
    const observer = new MutationObserver(onChange)
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
    })
    const media =
        typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)')
            : null
    // old Safari doesn't have addEventListener here
    media?.addEventListener?.('change', onChange)
    return () => {
        observer.disconnect()
        media?.removeEventListener?.('change', onChange)
    }
}

// the server can't know the theme, so assume dark
const serverMode = () => 'dark' as const

const FALLBACK_HSL: [number, number, number] = [211, 100, 52]

function hexToHsl(hex: string): [number, number, number] {
    if (typeof hex !== 'string') return FALLBACK_HSL
    let value = hex.replace('#', '')
    if (value.length === 4 || value.length === 8) {
        value = value.slice(0, value.length === 4 ? 3 : 6)
    }
    if (value.length === 3) {
        value = value.split('').map((c) => c + c).join('')
    }
    const r = parseInt(value.slice(0, 2), 16) / 255
    const g = parseInt(value.slice(2, 4), 16) / 255
    const b = parseInt(value.slice(4, 6), 16) / 255
    if (value.length !== 6 || [r, g, b].some(Number.isNaN)) return FALLBACK_HSL

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) return [0, 0, l * 100]

    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h: number
    switch (max) {
        case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6
            break
        case g:
            h = ((b - r) / d + 2) / 6
            break
        default:
            h = ((r - g) / d + 4) / 6
    }
    return [h * 360, s * 100, l * 100]
}

const hsl = (h: number, s: number, l: number, a = 1) => {
    const hue = ((h % 360) + 360) % 360
    return a === 1
        ? `hsl(${hue.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`
        : `hsl(${hue.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}% / ${a})`
}

function buildTheme(accent: string, mode: 'dark' | 'light' = 'dark') {
    const [h, s, l] = hexToHsl(accent)
    const tint = (lightness: number, sat = s) => hsl(h, sat, lightness)
    const dark = mode !== 'light'
    const accentTone = dark
        ? tint(Math.min(Math.max(l, 56), 70))
        : tint(Math.min(Math.max(l, 38), 50))
    // light mode just flips the lightness ramp
    const ramp = (lightness: number) => (dark ? lightness : 100 - lightness)

    const colors = dark
        ? {
              accent: accentTone,
              // Neutral chrome — matches the Rare UI preview surface (dark --card).
              bg: 'oklch(0.1822 0 0)',
              border: 'rgb(255 255 255 / 0.08)',
              headerBg: 'rgb(255 255 255 / 0.03)',
              plain: '#ffffff',
              muted: 'rgb(255 255 255 / 0.6)',
              gutter: 'rgb(255 255 255 / 0.28)',
              hoverWash: 'rgb(255 255 255 / 0.08)',
              floatBg: 'rgb(255 255 255 / 0.05)',
              selection: hsl(h, s, 58, 0.3),
              lineWash: hsl(h, s, 58, 0.1),
          }
        : {
              accent: accentTone,
              bg: 'oklch(0.985 0 0)',
              border: 'rgb(0 0 0 / 0.08)',
              headerBg: 'rgb(0 0 0 / 0.03)',
              plain: '#171717',
              muted: 'rgb(0 0 0 / 0.6)',
              gutter: 'rgb(0 0 0 / 0.32)',
              hoverWash: 'rgb(0 0 0 / 0.06)',
              floatBg: 'rgb(0 0 0 / 0.04)',
              selection: hsl(h, s, 45, 0.25),
              lineWash: hsl(h, s, 45, 0.08),
          }

    const theme: PrismTheme = {
        plain: { color: colors.plain, backgroundColor: 'transparent' },
        styles: [
            { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: tint(ramp(42), s * 0.35), fontStyle: 'italic' } },
            { types: ['punctuation'], style: { color: tint(ramp(62), s * 0.3) } },
            { types: ['operator', 'combinator'], style: { color: tint(ramp(70), s * 0.4) } },
            { types: ['keyword', 'selector', 'atrule', 'important', 'tag'], style: { color: accentTone } },
            { types: ['string', 'char', 'inserted', 'url'], style: { color: tint(ramp(76)) } },
            { types: ['function'], style: { color: tint(ramp(88), s * 0.5) } },
            { types: ['attr-name'], style: { color: tint(ramp(78), s * 0.7), fontStyle: 'italic' } },
            { types: ['number', 'boolean', 'constant', 'symbol', 'deleted'], style: { color: tint(ramp(70)) } },
            { types: ['class-name', 'maybe-class-name', 'builtin'], style: { color: tint(ramp(93), s * 0.35) } },
            { types: ['property', 'variable', 'parameter'], style: { color: tint(ramp(97), s * 0.15) } },
            { types: ['regex'], style: { color: tint(ramp(72), s * 0.6) } },
        ],
    }

    return { colors, theme }
}

/* ------------------------------- copy button ------------------------------- */

function CopyButton({ code, floating }: { code: string; floating?: boolean }) {
    const [copied, setCopied] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current)
    }, [])

    const copy = useCallback(async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code)
            } else {
                // Fallback for non-secure contexts where the Clipboard API is unavailable.
                const area = document.createElement('textarea')
                area.value = code
                area.style.position = 'fixed'
                area.style.opacity = '0'
                document.body.appendChild(area)
                area.select()
                document.execCommand('copy')
                area.remove()
            }
        } catch {
            return
        }
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), COPY_RESET_MS)
    }, [code])

    const reduceMotion = useReducedMotion()
    const swap = reduceMotion
        ? {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
          }
        : {
              initial: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
              animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
              exit: { opacity: 0, scale: 0.5, filter: 'blur(4px)' },
          }

    return (
        <motion.button
            type='button'
            data-slot='code-block-copy'
            aria-label={copied ? 'Copied' : 'Copy code'}
            onClick={copy}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            transition={TAP_SPRING}
            className={cn(
                'relative grid size-7 place-items-center rounded-lg text-(--cb-gutter) outline-none transition-[background-color,color] duration-150 ease-out hover:bg-(--cb-hover-wash) hover:text-(--cb-plain) focus-visible:ring-2 focus-visible:ring-(--cb-accent)/60',
                copied &&
                    'bg-(--cb-accent)/12 text-(--cb-accent) hover:bg-(--cb-accent)/12 hover:text-(--cb-accent)',
                floating &&
                    'absolute top-2.5 right-2.5 z-10 border border-(--cb-border) bg-(--cb-float-bg) backdrop-blur-md',
            )}
        >
            <AnimatePresence initial={false}>
                {copied ? (
                    <motion.span
                        key='check'
                        className='col-start-1 row-start-1'
                        {...swap}
                        transition={reduceMotion ? { duration: 0.15 } : CHECK_SPRING}
                    >
                        <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth={2.5}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='size-3.5'
                            aria-hidden
                        >
                            <motion.path
                                d='M4 12.5l5 5L20 6.5'
                                initial={reduceMotion ? false : { pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
                            />
                        </svg>
                    </motion.span>
                ) : (
                    <motion.span
                        key='copy'
                        className='col-start-1 row-start-1'
                        {...swap}
                        transition={reduceMotion ? { duration: 0.15 } : SWAP_SPRING}
                    >
                        <Copy className='size-3.5' />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}

export function CodeBlock({
    code,
    language = 'tsx',
    accent = '#F75001',
    mode = 'auto',
    filename,
    showFrame = true,
    showHeader = true,
    showLineNumbers = true,
    showCopyButton = true,
    highlightLines,
    className,
    style,
    ...props
}: CodeBlockProps) {
    // don't crash on bad props
    const safeLanguage = typeof language === 'string' ? language : 'tsx'
    const pageMode = useSyncExternalStore(subscribeToPageMode, resolvePageMode, serverMode)
    const safeMode = mode === 'light' || mode === 'dark' ? mode : pageMode
    const { colors, theme } = useMemo(() => buildTheme(accent, safeMode), [accent, safeMode])
    const trimmed = useMemo(() => {
        const source = typeof code === 'string' ? code : String(code ?? '')
        return source.replace(/^\n+/, '').trimEnd()
    }, [code])
    const highlighted = useMemo(
        () => new Set(Array.isArray(highlightLines) ? highlightLines : []),
        [highlightLines],
    )

    const cssVars = {
        '--cb-accent': colors.accent,
        '--cb-bg': colors.bg,
        '--cb-border': colors.border,
        '--cb-header-bg': colors.headerBg,
        '--cb-plain': colors.plain,
        '--cb-muted': colors.muted,
        '--cb-gutter': colors.gutter,
        '--cb-hover-wash': colors.hoverWash,
        '--cb-float-bg': colors.floatBg,
        '--cb-selection': colors.selection,
        '--cb-line-wash': colors.lineWash,
    } as React.CSSProperties

    return (
        <div
            data-slot='code-block'
            className={cn(
                'group relative flex flex-col overflow-hidden text-left',
                showFrame && 'rounded-2xl border border-(--cb-border) bg-(--cb-bg)',
                className,
            )}
            style={{ ...cssVars, ...style }}
            {...props}
        >
            {showFrame && showHeader && (
                <div
                    data-slot='code-block-header'
                    className='flex h-10 shrink-0 items-center gap-3 border-b border-(--cb-border) bg-(--cb-header-bg) px-3.5 backdrop-blur-md'
                >
                    <span className='min-w-0 flex-1 truncate font-mono text-xs text-(--cb-muted)'>
                        {filename ?? safeLanguage}
                    </span>
                    {showCopyButton && <CopyButton code={trimmed} />}
                </div>
            )}

            {!(showFrame && showHeader) && showCopyButton && <CopyButton code={trimmed} floating />}

            <div
                data-slot='code-block-viewport'
                role='region'
                aria-label={filename ?? `${safeLanguage} code`}
                tabIndex={0}
                className={cn(
                    'min-h-0 flex-1 overflow-auto outline-none selection:bg-(--cb-selection) focus-visible:ring-2 focus-visible:ring-(--cb-accent)/40 [scrollbar-width:thin] [scrollbar-color:var(--cb-border)_transparent]',
                    showFrame && 'py-3',
                )}
            >
                <Highlight code={trimmed} language={safeLanguage} theme={theme}>
                    {({ tokens, getLineProps, getTokenProps }) => {
                        const gutterWidth = `${String(tokens.length).length}ch`
                        return (
                            <pre
                                data-slot='code-block-pre'
                                className='w-max min-w-full font-mono text-[13px] leading-6 [tab-size:4]'
                            >
                                {tokens.map((line, i) => {
                                    const lineProps = getLineProps({ line })
                                    return (
                                        <div
                                            key={i}
                                            {...lineProps}
                                            className={cn(
                                                'relative flex min-w-full',
                                                showFrame && 'px-3.5',
                                                highlighted.has(i + 1) && 'bg-(--cb-line-wash)',
                                                lineProps.className,
                                            )}
                                        >
                                            {showLineNumbers && (
                                                <span
                                                    aria-hidden
                                                    className='mr-4 shrink-0 text-right text-(--cb-gutter) select-none'
                                                    style={{ width: gutterWidth }}
                                                >
                                                    {i + 1}
                                                </span>
                                            )}
                                            <span className='pr-3.5'>
                                                {line.map((token, key) => (
                                                    <span key={key} {...getTokenProps({ token })} />
                                                ))}
                                            </span>
                                        </div>
                                    )
                                })}
                            </pre>
                        )
                    }}
                </Highlight>
            </div>
        </div>
    )
}

export default CodeBlock
