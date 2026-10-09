"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  animate,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

export type RailTocItem = { id: string; label: string; depth?: number }

const RAIL_X = 5
const LABEL_GAP = 14
const TRAVEL_SPRING = { stiffness: 140, damping: 26, mass: 0.6 }
const TURN_SPRING = { stiffness: 260, damping: 30 }
// rail length the plane must back up before it turns around, so scroll jitter can't flip it
const TURN_SLACK = 2
// wheel or touch travel past either end of the scroller before the plane takes off
const OVERSCROLL = 720

const PLANE = "M12 2 20.5 21 12 17.5 3.5 21z"
// the plane is narrower than a dot, so the rail and dots under it are cut away
const PLANE_HOLE = 4

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

type Point = { x: number; y: number }
type Geometry = { nodes: Point[]; d: string; width: number; height: number }
type Fall = { xs: number[]; ys: number[]; angles: number[]; duration: number }

const FALL_STEP = 1 / 60
const THROW_SPEED = 260
const THROW_DECAY = 0.35
const SWAY = 56
const SWAY_PERIOD = 1.8
const BOB = 16
const SKID = 0.35

// a thrown paper plane: the throw dies off into a side to side drift down to the floor, then it skids flat
function planFall(
  nose: Point,
  left: number,
  right: number,
  floor: number,
): Fall {
  const side = nose.x < 0 ? -1 : 1
  const sway = Math.max(0, Math.min(SWAY, (right - left) / 2 - 8))
  const sink = Math.min(240, Math.max(90, floor / 2.6))
  const w = (2 * Math.PI) / SWAY_PERIOD
  const xs = [0]
  const ys = [0]

  for (let t = FALL_STEP; t < 8; t += FALL_STEP) {
    const thrown = THROW_SPEED * THROW_DECAY * (1 - Math.exp(-t / THROW_DECAY))
    const grow = 1 - Math.exp(-t / 0.5)
    const fx = nose.x * thrown + side * sway * grow * Math.sin(w * t)
    const fy =
      nose.y * thrown +
      sink * (t - 0.4 * (1 - Math.exp(-t / 0.4))) +
      (BOB * grow * (Math.cos(2 * w * t) - 1)) / 2
    xs.push(Math.min(right, Math.max(left, fx)))
    ys.push(Math.min(floor, fy))
    if (fy >= floor) break
  }

  const n = xs.length
  const drift = (xs[n - 1] - xs[n - 2]) / FALL_STEP
  for (let t = FALL_STEP; t <= SKID; t += FALL_STEP) {
    const k = 1 - t / SKID
    xs.push(
      Math.min(
        right,
        Math.max(left, xs[xs.length - 1] + drift * k * FALL_STEP),
      ),
    )
    ys.push(floor)
  }

  const angles: number[] = []
  for (let i = 0; i < xs.length; i++) {
    const a = Math.max(0, i - 1)
    const b = Math.min(xs.length - 1, i + 1)
    let angle = (Math.atan2(ys[b] - ys[a], xs[b] - xs[a]) * 180) / Math.PI + 90
    // on the floor it settles nose along the ground
    if (i >= n) {
      const k = Math.min(1, (i - n + 1) / (SKID / FALL_STEP))
      const lying = drift ? (drift < 0 ? 270 : 90) : angle < 180 ? 90 : 270
      angle += (lying - angle) * k
    }
    const prev = angles[i - 1] ?? angle
    angles.push(angle + 360 * Math.round((prev - angle) / 360))
  }

  return { xs, ys, angles, duration: (xs.length - 1) * FALL_STEP }
}

function sampleFall(values: number[], p: number) {
  const at = Math.min(1, Math.max(0, p)) * (values.length - 1)
  const i = Math.floor(at)
  const next = values[Math.min(values.length - 1, i + 1)]
  return values[i] + (next - values[i]) * (at - i)
}

function buildPath(nodes: Point[]) {
  const points: Point[] = [{ x: nodes[0].x, y: 0 }, nodes[0]]
  for (let i = 1; i < nodes.length; i++) {
    const from = nodes[i - 1]
    const to = nodes[i]
    if (from.x !== to.x) {
      const bend = (to.y - from.y) * 0.3
      points.push({ x: from.x, y: from.y + bend }, { x: to.x, y: to.y - bend })
    }
    points.push(to)
  }
  return points.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ")
}

// the rail only ever runs downward, so y is monotonic along its length
function lengthAtY(path: SVGPathElement, total: number, y: number) {
  let lo = 0
  let hi = total
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (path.getPointAtLength(mid).y < y) lo = mid
    else hi = mid
  }
  return hi
}

export type RailTocProps = React.ComponentProps<"nav"> & {
  items: RailTocItem[]
  containerRef?: React.RefObject<HTMLElement | null>
  offset?: number
  indent?: number
  title?: string
}

const RailToc = ({
  className,
  items,
  containerRef,
  offset = 96,
  indent = 14,
  title = "On this page",
  ...props
}: RailTocProps) => {
  const reduceMotion = useReducedMotion()
  const maskId = `rail-toc-${React.useId().replace(/[^\w-]/g, "")}`

  const listRef = React.useRef<HTMLUListElement>(null)
  const rowRefs = React.useRef<(HTMLLIElement | null)[]>([])
  const pathRef = React.useRef<SVGPathElement>(null)
  const holeRefs = React.useRef<(SVGCircleElement | null)[]>([])

  const [geometry, setGeometry] = React.useState<Geometry>()
  const [reached, setReached] = React.useState(1)

  const lengths = React.useRef<number[]>([])
  const total = React.useRef(0)
  const placed = React.useRef(false)
  const pinned = React.useRef<number | null>(null)
  const userScrolled = React.useRef(false)
  const facing = React.useRef<1 | -1>(1)
  const turnFrom = React.useRef(0)
  const spill = React.useRef(0)
  const fall = React.useRef<Fall | null>(null)
  const away = React.useRef<-1 | 0 | 1>(0)
  const planeRef = React.useRef<HTMLDivElement>(null)

  const target = useMotionValue(0)
  const travel = useSpring(target, TRAVEL_SPRING)
  const distance = reduceMotion ? target : travel

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const heading = useMotionValue(180)
  const turn = useSpring(heading, TURN_SPRING)
  const filled = useMotionValue(0)

  const flight = useMotionValue(0)
  const planeX = useTransform(() => {
    const p = flight.get()
    return x.get() + (fall.current && p ? sampleFall(fall.current.xs, p) : 0)
  })
  const planeY = useTransform(() => {
    const p = flight.get()
    return y.get() + (fall.current && p ? sampleFall(fall.current.ys, p) : 0)
  })

  const steer = React.useCallback(
    (angle: number) => {
      // unwrapped against the current heading so the turn spring takes the short way round
      const prev = heading.get()
      heading.set(angle + 360 * Math.round((prev - angle) / 360))
    },
    [heading],
  )

  const placeHoles = React.useCallback(() => {
    const r = `${PLANE_HOLE * Math.max(0, 1 - flight.get() * 8)}`
    holeRefs.current.forEach((hole) => {
      hole?.setAttribute("cx", `${planeX.get()}`)
      hole?.setAttribute("cy", `${planeY.get()}`)
      hole?.setAttribute("r", r)
    })
  }, [flight, planeX, planeY])

  useMotionValueEvent(planeX, "change", placeHoles)
  useMotionValueEvent(planeY, "change", placeHoles)

  const pose = React.useCallback(
    (l: number) => {
      const path = pathRef.current
      const length = total.current
      if (!path || !length) return
      const at = path.getPointAtLength(l)
      const behind = path.getPointAtLength(Math.max(0, l - 1))
      const ahead = path.getPointAtLength(Math.min(length, l + 1))
      x.set(at.x)
      y.set(at.y)
      if (!flight.get())
        steer(
          (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI +
            90 +
            (facing.current < 0 ? 180 : 0),
        )
      filled.set(l / length)
      setReached(lengths.current.filter((n) => n <= l + 0.5).length)
    },
    [x, y, flight, steer, filled],
  )

  useMotionValueEvent(distance, "change", pose)

  useMotionValueEvent(flight, "change", (p) => {
    placeHoles()
    if (!p || !fall.current) return pose(distance.get())
    // coming back it retraces the fall, so the nose flips to lead the way
    steer(sampleFall(fall.current.angles, p) + (away.current ? 0 : 180))
  })

  const aim = React.useCallback(
    (next: number) => {
      const from = turnFrom.current
      if ((next - from) * facing.current > 0) turnFrom.current = next
      else if (Math.abs(next - from) > TURN_SLACK) {
        facing.current = facing.current > 0 ? -1 : 1
        turnFrom.current = next
      }
      target.set(next)
    },
    [target],
  )

  const metrics = React.useCallback(() => {
    const scroller = containerRef?.current
    return {
      scroller,
      scrollTop: scroller ? scroller.scrollTop : window.scrollY,
      viewHeight: scroller ? scroller.clientHeight : window.innerHeight,
      scrollHeight: scroller
        ? scroller.scrollHeight
        : document.documentElement.scrollHeight,
    }
  }, [containerRef])

  const sync = React.useCallback(() => {
    const nodes = lengths.current
    if (!nodes.length) return

    // a clicked heading holds the plane until the reader scrolls, since headings near the end can't scroll up to the anchor
    if (pinned.current !== null) {
      aim(nodes[pinned.current] ?? nodes[0])
      return
    }

    const { scroller, scrollTop, viewHeight, scrollHeight } = metrics()
    const originTop = scroller ? scroller.getBoundingClientRect().top : 0

    // the anchor starts at the top edge and sweeps to the bottom near the end, so the first and last headings are both reachable
    const remaining = Math.max(0, scrollHeight - viewHeight - scrollTop)
    const line = Math.min(offset, scrollTop)
    const anchor = line + Math.max(0, viewHeight - line - remaining)

    const tops = items.map((item) => {
      const el = document.getElementById(item.id)
      return el ? el.getBoundingClientRect().top - originTop : Infinity
    })

    const index = tops.findLastIndex((top) => top <= anchor)
    let next: number
    if (index === -1) next = nodes[0]
    else if (index === nodes.length - 1) next = nodes[index]
    else {
      const span = tops[index + 1] - tops[index]
      const progress = span > 0 ? (anchor - tops[index]) / span : 0
      next =
        nodes[index] +
        Math.min(1, Math.max(0, progress)) * (nodes[index + 1] - nodes[index])
    }

    aim(next)
    if (!placed.current) {
      placed.current = true
      travel.jump(next)
      pose(next)
      turn.jump(heading.get())
    }
  }, [metrics, items, offset, aim, travel, turn, heading, pose])

  const takeOff = React.useCallback(
    (edge: -1 | 1) => {
      const plane = planeRef.current
      if (reduceMotion || away.current || !plane) return
      away.current = edge
      facing.current = edge
      turnFrom.current = target.get()
      const p = flight.get()
      // a plane still coming back picks its old fall up again, so it never jumps
      if (!p || !fall.current) {
        pose(distance.get())
        const rect = plane.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const box = containerRef?.current?.getBoundingClientRect() ?? {
          left: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        }
        // screen distances map back into the nav's own pixels when an ancestor scales it
        const list = listRef.current
        const scale =
          list && list.offsetHeight
            ? list.getBoundingClientRect().height / list.offsetHeight
            : 1
        const angle = (heading.get() * Math.PI) / 180
        fall.current = planFall(
          { x: Math.sin(angle), y: -Math.cos(angle) },
          (box.left + 10 - cx) / scale,
          (box.right - 10 - cx) / scale,
          Math.max(0, Math.min(box.bottom, window.innerHeight) - 8 - cy) /
            scale,
        )
      }
      animate(flight, 1, {
        duration: (1 - p) * fall.current.duration,
        ease: "linear",
      })
    },
    [reduceMotion, containerRef, target, pose, distance, heading, flight],
  )

  const land = React.useCallback(() => {
    spill.current = 0
    const edge = away.current
    if (!edge || !fall.current) return
    away.current = 0
    facing.current = edge > 0 ? -1 : 1
    turnFrom.current = target.get()
    animate(flight, 0, {
      duration: Math.max(0.6, flight.get() * fall.current.duration * 0.45),
      ease: [0.4, 0, 0.2, 1],
    })
  }, [target, flight])

  useIsoLayoutEffect(() => {
    const list = listRef.current
    if (!list || !items.length) return

    const measure = () => {
      const nodes = items.map((item, i) => {
        const row = rowRefs.current[i]
        return {
          x: RAIL_X + (item.depth ?? 0) * indent,
          y: row ? row.offsetTop + row.offsetHeight / 2 : 0,
        }
      })
      setGeometry({
        nodes,
        d: buildPath(nodes),
        width: Math.max(...nodes.map((n) => n.x)) + RAIL_X + 4,
        height: list.offsetHeight,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [items, indent])

  useIsoLayoutEffect(() => {
    const path = pathRef.current
    if (!path || !geometry) return
    total.current = path.getTotalLength()
    lengths.current = geometry.nodes.map((n) =>
      lengthAtY(path, total.current, n.y),
    )
    sync()
    pose(distance.get())
    placeHoles()
  }, [geometry, sync, pose, distance, placeHoles])

  React.useEffect(() => {
    const scroller = containerRef?.current ?? window
    let touchY = 0

    const edges = () => {
      const { scrollTop, viewHeight, scrollHeight } = metrics()
      return {
        atTop: scrollTop <= 1,
        atEnd: scrollTop >= scrollHeight - viewHeight - 1,
      }
    }
    const spillBy = (delta: number) => {
      const { atTop, atEnd } = edges()
      const edge = delta > 0 && atEnd ? 1 : delta < 0 && atTop ? -1 : 0
      if (!edge || Math.sign(spill.current) === -edge) spill.current = 0
      if (!edge) return
      spill.current += delta
      if (Math.abs(spill.current) > OVERSCROLL) takeOff(edge)
    }

    const onIntent = () => {
      userScrolled.current = true
    }
    const onWheel = (e: WheelEvent) => {
      userScrolled.current = true
      spillBy(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY)
    }
    const onTouchStart = (e: TouchEvent) => {
      userScrolled.current = true
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const next = e.touches[0]?.clientY ?? touchY
      spillBy(touchY - next)
      touchY = next
    }
    const onScroll = () => {
      if (pinned.current !== null && userScrolled.current) pinned.current = null
      const { atTop, atEnd } = edges()
      const edge = away.current
      if (edge && (edge > 0 ? !atEnd : !atTop)) land()
      if (!atTop && !atEnd) spill.current = 0
      sync()
    }
    scroller.addEventListener("scroll", onScroll, { passive: true })
    scroller.addEventListener("wheel", onWheel as EventListener, {
      passive: true,
    })
    scroller.addEventListener("touchstart", onTouchStart as EventListener, {
      passive: true,
    })
    scroller.addEventListener("touchmove", onTouchMove as EventListener, {
      passive: true,
    })
    scroller.addEventListener("pointerdown", onIntent)
    window.addEventListener("keydown", onIntent)
    window.addEventListener("resize", sync)
    return () => {
      scroller.removeEventListener("scroll", onScroll)
      scroller.removeEventListener("wheel", onWheel as EventListener)
      scroller.removeEventListener("touchstart", onTouchStart as EventListener)
      scroller.removeEventListener("touchmove", onTouchMove as EventListener)
      scroller.removeEventListener("pointerdown", onIntent)
      window.removeEventListener("keydown", onIntent)
      window.removeEventListener("resize", sync)
    }
  }, [containerRef, sync, metrics, takeOff, land])

  const select = (index: number) => {
    const el = document.getElementById(items[index].id)
    if (!el) return
    land()
    pinned.current = index
    userScrolled.current = false
    sync()
    const scroller = containerRef?.current
    const top = scroller
      ? el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop
      : el.getBoundingClientRect().top + window.scrollY
    const behavior = reduceMotion ? "auto" : "smooth"
    ;(scroller ?? window).scrollTo({ top: top - offset, behavior })
  }

  const active = Math.max(0, reached - 1)
  const railColor =
    "[--rail:color-mix(in_oklab,var(--foreground)_45%,var(--background))]"

  return (
    <nav
      data-slot="rail-toc"
      aria-label={title}
      className={cn("w-max text-sm", railColor, className)}
      {...props}
    >
      <p
        data-slot="rail-toc-title"
        className="mb-3 flex items-center gap-2 font-medium text-foreground/70"
      >
        <svg
          viewBox="0 0 16 16"
          className="-ml-0.5 h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M2 4h12M2 8h8M2 12h10" />
        </svg>
        {title}
      </p>

      <ul ref={listRef} data-slot="rail-toc-list" className="relative">
        {geometry && (
          <svg
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            width={geometry.width}
            height={geometry.height}
            aria-hidden
          >
            <linearGradient
              id={`${maskId}-fade`}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={0}
              y2={geometry.nodes[0].y - 4}
            >
              <stop offset="0" stopColor="black" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x={-8}
              y={-8}
              width={geometry.width + 16}
              height={geometry.height + 16}
            >
              <rect
                x={-8}
                y={-8}
                width={geometry.width + 16}
                height={geometry.height + 16}
                fill={`url(#${maskId}-fade)`}
              />
              {geometry.nodes.map((node, i) => (
                <circle key={i} cx={node.x} cy={node.y} r={4} fill="black" />
              ))}
              <circle
                ref={(el) => {
                  holeRefs.current[0] = el
                }}
                r={PLANE_HOLE}
                fill="black"
              />
            </mask>
            <mask
              id={`${maskId}-nodes`}
              maskUnits="userSpaceOnUse"
              x={-8}
              y={-8}
              width={geometry.width + 16}
              height={geometry.height + 16}
            >
              <rect
                x={-8}
                y={-8}
                width={geometry.width + 16}
                height={geometry.height + 16}
                fill="white"
              />
              <circle
                ref={(el) => {
                  holeRefs.current[1] = el
                }}
                r={PLANE_HOLE}
                fill="black"
              />
            </mask>
            <g mask={`url(#${maskId})`}>
              <path
                ref={pathRef}
                d={geometry.d}
                fill="none"
                strokeWidth="1.25"
                strokeDasharray="2 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-foreground/25"
              />
              <motion.path
                d={geometry.d}
                fill="none"
                strokeWidth="1.25"
                stroke="var(--rail)"
                strokeLinejoin="round"
                style={{ pathLength: filled }}
              />
            </g>
            <g mask={`url(#${maskId}-nodes)`}>
              {geometry.nodes.map((node, i) => {
                const covered = i < reached
                return (
                  <circle
                    key={items[i]?.id ?? i}
                    cx={node.x}
                    cy={node.y}
                    r={covered ? 3 : 3.25}
                    strokeWidth="1.25"
                    className={cn(
                      "transition-[fill,stroke] duration-200",
                      covered
                        ? "fill-[var(--rail)] stroke-[var(--rail)]"
                        : "fill-transparent stroke-foreground/30",
                    )}
                  />
                )
              })}
            </g>
          </svg>
        )}

        {geometry && (
          <motion.div
            ref={planeRef}
            data-slot="rail-toc-plane"
            className="pointer-events-none absolute left-0 top-0 -ml-2 -mt-2 h-4 w-4 text-foreground [filter:drop-shadow(0_0_2px_rgb(0_0_0/0.35))]"
            style={{
              x: planeX,
              y: planeY,
              rotate: reduceMotion ? heading : turn,
            }}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 overflow-visible">
              <path
                d={PLANE}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}

        {items.map((item, i) => {
          const isActive = i === active
          return (
            <li
              key={item.id}
              ref={(el) => {
                rowRefs.current[i] = el
              }}
            >
              <button
                type="button"
                onClick={() => select(i)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block w-full rounded-md py-1.5 pr-2 text-left leading-5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-foreground/50 hover:text-foreground/80",
                )}
                style={{
                  paddingLeft: RAIL_X + (item.depth ?? 0) * indent + LABEL_GAP,
                }}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { RailToc }
export default RailToc
