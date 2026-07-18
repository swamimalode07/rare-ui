"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type GlyphType = "letters" | "numbers" | "both";

export type GravityLettersProps = React.ComponentProps<"div"> & {
  type?: GlyphType;
  // custom drop pool — emoji, strings, or any react node; wins over `type`
  items?: React.ReactNode[];
  gravity?: number;
  size?: number;
  color?: string;
  maxGlyphs?: number;
};

const POOLS: Record<GlyphType, string> = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  both: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
};

const COL = 8; // heightmap column width, px
const CLEARANCE = 24; // min air above the landing spot at spawn
const SLOPE = 0.35; // slide on when a neighbor sits this fraction of a glyph lower
const LEAVE_MS = 350;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const randomChar = (type: GlyphType) => {
  const pool = POOLS[type];
  return pool[Math.floor(Math.random() * pool.length)];
};

const pickContent = (items: React.ReactNode[] | undefined, type: GlyphType) =>
  items && items.length > 0
    ? items[Math.floor(Math.random() * items.length)]
    : randomChar(type);

/* --------------------------- heightmap helpers --------------------------- */

const spanOf = (x: number, w: number, cols: number) => {
  const from = Math.max(0, Math.floor(x / COL));
  const to = Math.min(cols - 1, Math.max(from, Math.ceil((x + w) / COL) - 1));
  return [from, to] as const;
};

// pile height under [x, x + w]
const topAt = (heights: number[], x: number, w: number) => {
  const [from, to] = spanOf(x, w, heights.length);
  if (to < from) return Number.POSITIVE_INFINITY;
  let top = 0;
  for (let i = from; i <= to; i++) top = Math.max(top, heights[i]);
  return top;
};

const raise = (heights: number[], x: number, w: number, top: number) => {
  const [from, to] = spanOf(x, w, heights.length);
  for (let i = from; i <= to; i++) heights[i] = Math.max(heights[i], top);
};

// tallest column in [from, to]; out of bounds reads as an infinite wall
const windowTop = (heights: number[], from: number, to: number) => {
  if (from < 0 || to >= heights.length) return Number.POSITIVE_INFINITY;
  let top = 0;
  for (let i = from; i <= to; i++) top = Math.max(top, heights[i]);
  return top;
};

// walk downhill until no neighbor sits clearly lower — hills, not towers
const findRestX = (
  heights: number[],
  x: number,
  w: number,
  h: number,
  maxX: number,
  bias: -1 | 1,
) => {
  let cur = Math.min(Math.max(x, 0), maxX);
  const drop = h * SLOPE;
  for (let i = 0; i < 64; i++) {
    const [from, to] = spanOf(cur, w, heights.length);
    const span = to - from + 1;
    const top = windowTop(heights, from, to);
    const dl = top - windowTop(heights, from - span, from - 1);
    const dr = top - windowTop(heights, to + 1, to + span);

    let next = cur;
    if (dl > drop && dr > drop && Math.abs(dl - dr) <= 1) {
      next = bias < 0 ? Math.max(cur - w, 0) : Math.min(cur + w, maxX);
    } else if (dl > drop && dl >= dr) {
      next = Math.max(cur - w, 0);
    } else if (dr > drop) {
      next = Math.min(cur + w, maxX);
    }
    if (next === cur) break;
    cur = next;
  }
  return cur;
};

/* ------------------------------- animation ------------------------------- */

// render data + click snapshot, lives in state
type Glyph = {
  id: number;
  content: React.ReactNode;
  fontSize: number;
  x: number;
  y: number;
  still: boolean;
  leaving?: boolean;
};

// flight data, lives in refs — the rest spot is reserved at spawn so glyphs
// can never collide mid-air
type Body = {
  el: HTMLSpanElement;
  w: number;
  h: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vy: number;
  rot: number;
  vr: number;
  done: boolean;
};

const paint = (body: Body) => {
  body.el.style.transform = `translate3d(${body.x}px, ${body.y}px, 0) rotate(${body.rot}deg)`;
};

const squash = (body: Body) => {
  body.el.firstElementChild?.animate(
    [{ transform: "scaleY(0.82)" }, { transform: "scaleY(1)" }],
    { duration: 160, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
  );
};

function useFallingGlyphs(opts: { gravity: number; maxGlyphs: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef(new Map<number, Body>());
  const refsRef = useRef(
    new Map<number, (el: HTMLSpanElement | null) => void>(),
  );
  // settled glyphs plus the reserved slots of in-flight ones
  const heightsRef = useRef<number[]>([]);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const timeoutsRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  // instance-scoped so fast refresh can't reset it under live state
  const idRef = useRef(0);
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);

  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  // pick and reserve a rest spot, then aim the body's flight at it
  const retarget = (body: Body, width: number, height: number) => {
    const heights = heightsRef.current;
    const maxX = Math.max(width - body.w, 0);
    const bias = Math.random() < 0.5 ? -1 : (1 as const);
    const targetX = findRestX(heights, body.x, body.w, body.h, maxX, bias);
    const targetY = height - topAt(heights, targetX, body.w) - body.h;
    raise(heights, targetX, body.w, height - targetY);
    body.x0 = body.x;
    body.y0 = Math.min(body.y, targetY);
    body.targetX = targetX;
    body.targetY = targetY;
    body.done = false;
  };

  // re-reserve everything bottom-up; anything left floating falls again
  const rebuild = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const cols = Math.max(1, Math.ceil(width / COL));
    const heights = (heightsRef.current = new Array<number>(cols).fill(0));

    const bodies = [...bodiesRef.current.values()].sort((a, b) => b.y - a.y);
    for (const body of bodies) {
      if (body.done) {
        const rest = height - topAt(heights, body.x, body.w) - body.h;
        if (body.y < rest - 1) {
          body.vy = 0;
          retarget(body, width, height);
        } else {
          raise(heights, body.x, body.w, height - body.y);
        }
      } else {
        retarget(body, width, height);
      }
    }
  }, []);

  const step = useCallback(function frame(now: number) {
    const { gravity } = optsRef.current;
    const dt = Math.max(0, Math.min((now - lastRef.current) / 1000, 1 / 30));
    lastRef.current = now;

    let active = false;
    for (const body of bodiesRef.current.values()) {
      if (body.done) continue;

      body.vy += gravity * dt;
      body.y += body.vy * dt;
      body.rot += body.vr * dt;

      // x eases into the reserved spot as the fall progresses
      const total = body.targetY - body.y0;
      const p = total > 0 ? Math.min((body.y - body.y0) / total, 1) : 1;
      body.x = body.x0 + (body.targetX - body.x0) * p * (2 - p);

      if (body.y >= body.targetY) {
        body.x = body.targetX;
        body.y = body.targetY;
        body.done = true;
        paint(body);
        squash(body);
        continue;
      }

      paint(body);
      active = true;
    }

    rafRef.current = active ? requestAnimationFrame(frame) : 0;
  }, []);

  const wake = useCallback(() => {
    if (rafRef.current) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  // build (or re-bind) a glyph's body — safe to run repeatedly
  const attach = useCallback(
    (glyph: Glyph, el: HTMLSpanElement) => {
      const existing = bodiesRef.current.get(glyph.id);
      if (existing) {
        existing.el = el;
        paint(existing);
        return;
      }

      const container = containerRef.current;
      const width = container?.clientWidth ?? 0;
      const height = container?.clientHeight ?? 0;
      if (heightsRef.current.length !== Math.max(1, Math.ceil(width / COL))) {
        rebuild();
      }

      const w = el.offsetWidth || 1;
      const h = el.offsetHeight || 1;
      const body: Body = {
        el,
        w,
        h,
        x0: 0,
        y0: 0,
        x: Math.min(Math.max(glyph.x - w / 2, 0), Math.max(width - w, 0)),
        y: glyph.y - h / 2,
        targetX: 0,
        targetY: 0,
        vy: 0,
        rot: 0,
        vr: glyph.still ? 0 : rand(-70, 70),
        done: false,
      };
      retarget(body, width, height);

      if (glyph.still) {
        body.x = body.x0 = body.targetX;
        body.y = body.y0 = body.targetY;
        body.done = true;
      } else {
        // spawn above anything landing beneath so arrivals stay bottom-first
        let startY = Math.min(body.y, body.targetY - CLEARANCE);
        for (const other of bodiesRef.current.values()) {
          const overlaps =
            other.targetX < body.targetX + w &&
            body.targetX < other.targetX + other.w;
          if (!other.done && overlaps) {
            startY = Math.min(startY, other.y - h - 8);
          }
        }
        body.y = body.y0 = startY;
      }

      bodiesRef.current.set(glyph.id, body);
      paint(body);

      if (!glyph.still) {
        el.firstElementChild?.animate(
          [
            { transform: "scale(0.5)", opacity: 0.3 },
            { transform: "scale(1)", opacity: 1 },
          ],
          { duration: 150, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
        );
      }
    },
    [rebuild],
  );

  const glyphRef = (glyph: Glyph) => {
    let callback = refsRef.current.get(glyph.id);
    if (!callback) {
      callback = (el) => {
        if (el) attach(glyph, el);
      };
      refsRef.current.set(glyph.id, callback);
    }
    return callback;
  };

  const addGlyph = (spawn: Omit<Glyph, "id">) => {
    const glyph: Glyph = { ...spawn, id: idRef.current++ };
    setGlyphs((prev) => {
      const next = [...prev, glyph];
      const overflow = next.filter((g) => !g.leaving).length - opts.maxGlyphs;
      if (overflow <= 0) return next;

      // past the cap, fade out the oldest before removing them
      let marked = 0;
      return next.map((g) => {
        if (marked < overflow && !g.leaving) {
          marked++;
          return { ...g, leaving: true };
        }
        return g;
      });
    });
  };

  // after each commit: prune removed glyphs, fade the leaving, keep the loop alive
  useEffect(() => {
    const alive = new Set(glyphs.map((g) => g.id));
    let removed = false;
    for (const id of bodiesRef.current.keys()) {
      if (!alive.has(id)) {
        bodiesRef.current.delete(id);
        refsRef.current.delete(id);
        removed = true;
      }
    }
    if (removed) rebuild();

    const leaving = glyphs.filter((g) => g.leaving).map((g) => g.id);
    if (leaving.length > 0) {
      const ids = new Set(leaving);
      const timeout = setTimeout(() => {
        timeoutsRef.current.delete(timeout);
        setGlyphs((current) => current.filter((g) => !ids.has(g.id)));
      }, LEAVE_MS);
      timeoutsRef.current.add(timeout);
    }

    if (glyphs.length > 0) wake();
  }, [glyphs, wake, rebuild]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return { containerRef, glyphs, glyphRef, addGlyph };
}

/* ------------------------------- component ------------------------------- */

const GravityLetters = ({
  type = "letters",
  items,
  gravity = 800,
  size = 28,
  color,
  maxGlyphs = Infinity,
  className,
  children,
  onPointerDown,
  ...props
}: GravityLettersProps) => {
  const { containerRef, glyphs, glyphRef, addGlyph } = useFallingGlyphs({
    gravity,
    maxGlyphs,
  });

  const drop = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    addGlyph({
      content: pickContent(items, type),
      fontSize: Math.round(size * rand(0.8, 1.2)),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      still: reduce,
    });
  };

  return (
    <div
      ref={containerRef}
      data-slot="gravity-letters"
      className={cn(
        "relative touch-manipulation overflow-hidden select-none",
        className,
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.button === 0 && !event.defaultPrevented) drop(event);
      }}
      {...props}
    >
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {glyphs.map((glyph) => (
          <span
            key={glyph.id}
            ref={glyphRef(glyph)}
            className="absolute top-0 left-0 font-semibold transition-opacity duration-300 will-change-transform"
            style={{
              fontSize: glyph.fontSize,
              lineHeight: 1,
              color,
              opacity: glyph.leaving ? 0 : 1,
            }}
          >
            <span className="inline-block origin-bottom">{glyph.content}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default GravityLetters;
