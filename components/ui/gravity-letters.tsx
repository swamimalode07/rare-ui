"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type GlyphType = "letters" | "numbers" | "both";

export type GravityLettersProps = React.ComponentProps<"div"> & {
  type?: GlyphType;
  items?: React.ReactNode[];
  gravity?: number;
  size?: number;
  color?: string;
  maxGlyphs?: number;
  deviceTilt?: boolean;
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
const TILT = 26; // max rest tilt, deg
const BOUNCE = 0.22; // restitution of the first touch
const HOLD_MS = 300; // hold this long to start pouring
const POUR_MS = 120; // pour cadence while held
const TILT_ON = 10; // device tilt (deg) that starts an avalanche
const SHAKE_MS = 350; // min gap between tilt avalanches
const EAGER = 0.45; // slide-threshold factor while tilted

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const randomChar = (type: GlyphType) => {
  const pool = POOLS[type];
  return pool[Math.floor(Math.random() * pool.length)];
};

const pickContent = (items: React.ReactNode[] | undefined, type: GlyphType) =>
  items && items.length > 0
    ? items[Math.floor(Math.random() * items.length)]
    : randomChar(type);

const spanOf = (x: number, w: number, cols: number) => {
  const from = Math.max(0, Math.floor(x / COL));
  const to = Math.min(cols - 1, Math.max(from, Math.ceil((x + w) / COL) - 1));
  return [from, to] as const;
};

const restY = (
  heights: number[],
  x: number,
  w: number,
  h: number,
  rot: number,
  height: number,
) => {
  const [from, to] = spanOf(x, w, heights.length);
  const tan = Math.tan((Math.abs(rot) * Math.PI) / 180);
  let y = Number.POSITIVE_INFINITY;
  for (let i = from; i <= to; i++) {
    const cx = clamp((i + 0.5) * COL - x, 0, w);
    const edge = Math.min((rot >= 0 ? w - cx : cx) * tan, h - 1);
    y = Math.min(y, height - heights[i] - h + edge);
  }
  return y;
};

const deposit = (
  heights: number[],
  x: number,
  w: number,
  h: number,
  rot: number,
  y: number,
  height: number,
) => {
  const [from, to] = spanOf(x, w, heights.length);
  const tan = Math.tan((Math.abs(rot) * Math.PI) / 180);
  for (let i = from; i <= to; i++) {
    const cx = clamp((i + 0.5) * COL - x, 0, w);
    const edge = Math.min((rot >= 0 ? cx : w - cx) * tan, h - 1);
    heights[i] = Math.max(heights[i], height - y - edge);
  }
};

const windowTop = (heights: number[], from: number, to: number) => {
  if (from < 0 || to >= heights.length) return Number.POSITIVE_INFINITY;
  let top = 0;
  for (let i = from; i <= to; i++) top = Math.max(top, heights[i]);
  return top;
};

const groundTilt = (heights: number[], x: number, w: number) => {
  const [from, to] = spanOf(x, w, heights.length);
  if (to <= from) return 0;
  const mid = Math.ceil((from + to) / 2);
  const hl = windowTop(heights, from, mid - 1);
  const hr = windowTop(heights, mid, to);
  if (!Number.isFinite(hl) || !Number.isFinite(hr)) return 0;
  const run = Math.max(((to - from + 1) / 2) * COL, 1);
  return (Math.atan2(hl - hr, run) * 180) / Math.PI;
};

const findRestX = (
  heights: number[],
  x: number,
  w: number,
  h: number,
  maxX: number,
  bias: -1 | 1,
  eager = 1,
) => {
  let cur = Math.min(Math.max(x, 0), maxX);
  const drop = h * SLOPE * eager;
  const step = Math.max(COL, Math.round(w / 3));
  for (let i = 0; i < 64; i++) {
    const [from, to] = spanOf(cur, w, heights.length);
    const span = to - from + 1;
    const top = windowTop(heights, from, to);
    const dl = top - windowTop(heights, from - span, from - 1);
    const dr = top - windowTop(heights, to + 1, to + span);

    let next = cur;
    if (dl > drop && dr > drop && Math.abs(dl - dr) <= 1) {
      next = bias < 0 ? Math.max(cur - step, 0) : Math.min(cur + step, maxX);
    } else if (dl > drop && dl >= dr) {
      next = Math.max(cur - step, 0);
    } else if (dr > drop) {
      next = Math.min(cur + step, maxX);
    }
    if (next === cur) break;
    cur = next;
  }
  return cur;
};

type Glyph = {
  id: number;
  content: React.ReactNode;
  fontSize: number;
  x: number;
  y: number;
  still: boolean;
  leaving?: boolean;
};

type Body = {
  el: HTMLSpanElement;
  ew: number;
  eh: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vy: number;
  spin: number;
  rot: number;
  vr: number;
  restRot: number;
  sway: number;
  bounced: boolean;
  done: boolean;
};

const paint = (body: Body) => {
  body.el.style.transform = `translate3d(${body.x + body.dx}px, ${body.y + body.dy}px, 0) rotate(${body.rot}deg)`;
};

const squash = (body: Body) => {
  body.el.firstElementChild?.animate(
    [{ transform: "scaleY(0.82)" }, { transform: "scaleY(1)" }],
    { duration: 160, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
  );
};

function useFallingGlyphs(opts: {
  gravity: number;
  maxGlyphs: number;
  deviceTilt: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef(new Map<number, Body>());
  const refsRef = useRef(
    new Map<number, (el: HTMLSpanElement | null) => void>(),
  );
  const heightsRef = useRef<number[]>([]);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const timeoutsRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const idRef = useRef(0);
  const windRef = useRef<0 | -1 | 1>(0);
  const lastShakeRef = useRef(0);
  const armedRef = useRef(false);
  const [tiltReady, setTiltReady] = useState(false);
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);

  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  const retarget = (body: Body, width: number, height: number) => {
    const heights = heightsRef.current;
    const wind = windRef.current;
    const bias = wind !== 0 ? wind : Math.random() < 0.5 ? -1 : (1 as const);
    const seekX = findRestX(
      heights,
      body.x,
      body.ew,
      body.eh,
      Math.max(width - body.ew, 0),
      bias,
      wind !== 0 ? EAGER : 1,
    );

    const squareness = Math.min(1, body.eh / body.ew);
    const jitter = rand(-1, 1) * (2 + 8 * squareness);
    const restRot = clamp(
      groundTilt(heights, seekX, body.ew) + jitter,
      -TILT,
      TILT,
    );
    const rad = (Math.abs(restRot) * Math.PI) / 180;
    body.restRot = restRot;
    body.w = body.ew * Math.cos(rad) + body.eh * Math.sin(rad);
    body.h = body.ew * Math.sin(rad) + body.eh * Math.cos(rad);
    body.dx = (body.w - body.ew) / 2;
    body.dy = (body.h - body.eh) / 2;

    const targetX = clamp(seekX - body.dx, 0, Math.max(width - body.w, 0));
    const targetY = restY(heights, targetX, body.w, body.h, restRot, height);
    deposit(heights, targetX, body.w, body.h, restRot, targetY, height);
    body.x0 = body.x;
    body.y0 = Math.min(body.y, targetY);
    body.targetX = targetX;
    body.targetY = targetY;
    body.sway = rand(-1, 1) * Math.min(12, (targetY - body.y0) * 0.05);
    body.bounced = false;
    body.done = false;
  };

  const rebuild = useCallback((slide = false) => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const cols = Math.max(1, Math.ceil(width / COL));
    const heights = (heightsRef.current = new Array<number>(cols).fill(0));

    const bodies = [...bodiesRef.current.values()].sort((a, b) => b.y - a.y);
    for (const body of bodies) {
      body.spin = body.rot;
      if (!body.done) {
        retarget(body, width, height);
        continue;
      }
      const rest = restY(heights, body.x, body.w, body.h, body.restRot, height);
      let falls = body.y < rest - 1;
      if (!falls && slide) {
        const dir = windRef.current || 1;
        const probe = findRestX(
          heights,
          body.x,
          body.ew,
          body.eh,
          Math.max(width - body.ew, 0),
          dir,
          EAGER,
        );
        const candX = clamp(probe - body.dx, 0, Math.max(width - body.w, 0));
        const candY = restY(heights, candX, body.w, body.h, body.restRot, height);
        falls = candY > body.y + 2;
        if (falls) body.vr = rand(-40, 40);
      }
      if (falls) {
        body.vy = 0;
        retarget(body, width, height);
      } else {
        deposit(heights, body.x, body.w, body.h, body.restRot, body.y, height);
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
      body.spin += body.vr * dt;

      const total = body.targetY - body.y0;
      const p = total > 0 ? Math.min((body.y - body.y0) / total, 1) : 1;
      body.x =
        body.x0 +
        (body.targetX - body.x0) * p * (2 - p) +
        Math.sin(p * Math.PI) * body.sway;
      const blend = p * p * p;
      body.rot = body.spin * (1 - blend) + body.restRot * blend;

      if (body.y >= body.targetY) {
        body.x = body.targetX;
        body.y = body.targetY;
        body.rot = body.restRot;

        const rebound = body.vy * BOUNCE;
        if (!body.bounced && rebound * rebound > gravity * 6) {
          body.bounced = true;
          body.vy = -rebound;
          body.x0 = body.targetX;
          body.y0 = body.targetY;
          body.sway = 0;
          body.vr = 0;
          body.spin = body.restRot;
          paint(body);
          squash(body);
          active = true;
          continue;
        }

        body.done = true;
        paint(body);
        if (!body.bounced) squash(body);
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

  const armTilt = useCallback(() => {
    if (armedRef.current) return;
    armedRef.current = true;
    const DOE = window.DeviceOrientationEvent as unknown as
      | { requestPermission?: () => Promise<string> }
      | undefined;
    if (typeof DOE?.requestPermission !== "function") return;
    DOE.requestPermission()
      .then((state) => state === "granted" && setTiltReady(true))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const DOE = window.DeviceOrientationEvent as unknown as
      | { requestPermission?: () => Promise<string> }
      | undefined;
    if (DOE && typeof DOE.requestPermission !== "function") setTiltReady(true);
  }, []);

  const tiltEnabled = opts.deviceTilt;
  useEffect(() => {
    if (!tiltEnabled || !tiltReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onTilt = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0;
      windRef.current = gamma > TILT_ON ? 1 : gamma < -TILT_ON ? -1 : 0;
      if (
        windRef.current !== 0 &&
        performance.now() - lastShakeRef.current > SHAKE_MS
      ) {
        lastShakeRef.current = performance.now();
        rebuild(true);
        wake();
      }
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      windRef.current = 0;
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [tiltEnabled, tiltReady, rebuild, wake]);

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

      const ew = el.offsetWidth || 1;
      const eh = el.offsetHeight || 1;
      const squareness = Math.min(1, eh / ew);
      const body: Body = {
        el,
        ew,
        eh,
        w: ew,
        h: eh,
        dx: 0,
        dy: 0,
        x0: 0,
        y0: 0,
        x: Math.min(Math.max(glyph.x - ew / 2, 0), Math.max(width - ew, 0)),
        y: glyph.y - eh / 2,
        targetX: 0,
        targetY: 0,
        vy: 0,
        spin: glyph.still ? 0 : rand(-1, 1) * (4 + 10 * squareness),
        rot: 0,
        vr: glyph.still ? 0 : rand(-1, 1) * (50 + 130 * squareness),
        restRot: 0,
        sway: 0,
        bounced: false,
        done: false,
      };
      retarget(body, width, height);

      if (glyph.still) {
        body.x = body.x0 = body.targetX;
        body.y = body.y0 = body.targetY;
        body.rot = body.restRot;
        body.done = true;
      } else {
        body.rot = body.spin;
        let startY = Math.min(body.y, body.targetY - CLEARANCE);
        for (const other of bodiesRef.current.values()) {
          const overlaps =
            other.targetX < body.targetX + body.w &&
            body.targetX < other.targetX + other.w;
          if (!other.done && overlaps) {
            startY = Math.min(startY, other.y - body.h - 8);
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

  return { containerRef, glyphs, glyphRef, addGlyph, armTilt };
}

type Pour = {
  id: number;
  x: number;
  y: number;
  hold: ReturnType<typeof setTimeout> | null;
  timer: ReturnType<typeof setInterval> | null;
};

const GravityLetters = ({
  type = "letters",
  items,
  gravity = 800,
  size = 28,
  color,
  maxGlyphs = Infinity,
  deviceTilt = true,
  className,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: GravityLettersProps) => {
  const { containerRef, glyphs, glyphRef, addGlyph, armTilt } =
    useFallingGlyphs({ gravity, maxGlyphs, deviceTilt });
  const pourRef = useRef<Pour | null>(null);

  const dropAt = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    addGlyph({
      content: pickContent(items, type),
      fontSize: Math.round(size * rand(0.8, 1.2)),
      x: clamp(clientX - rect.left, 0, rect.width),
      y: clamp(clientY - rect.top, 0, rect.height),
      still: reduce,
    });
  };

  const stopPour = () => {
    const pour = pourRef.current;
    if (!pour) return;
    if (pour.hold) clearTimeout(pour.hold);
    if (pour.timer) clearInterval(pour.timer);
    pourRef.current = null;
  };

  const startPour = (event: React.PointerEvent<HTMLDivElement>) => {
    stopPour();
    const pour: Pour = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      hold: null,
      timer: null,
    };
    pour.hold = setTimeout(() => {
      pour.timer = setInterval(() => {
        dropAt(pour.x + rand(-8, 8), pour.y);
      }, POUR_MS);
    }, HOLD_MS);
    pourRef.current = pour;
  };

  useEffect(() => {
    return () => {
      const pour = pourRef.current;
      if (pour?.hold) clearTimeout(pour.hold);
      if (pour?.timer) clearInterval(pour.timer);
    };
  }, []);

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
        if (event.button !== 0 || event.defaultPrevented) return;
        armTilt();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // capture is optional
        }
        dropAt(event.clientX, event.clientY);
        startPour(event);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const pour = pourRef.current;
        if (pour && event.pointerId === pour.id) {
          pour.x = event.clientX;
          pour.y = event.clientY;
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (pourRef.current?.id === event.pointerId) stopPour();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        if (pourRef.current?.id === event.pointerId) stopPour();
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
