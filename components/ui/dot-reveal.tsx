"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type DotRevealProps = Omit<ComponentProps<"div">, "children"> & {
  src?: string | null;
  alt?: string;
  progress?: number;
  aspect?: number;
  caption?: string;
  spacing?: number;
  showPercent?: boolean;
  estimatedDuration?: number;
  onRevealComplete?: () => void;
  onError?: () => void;
};

// hold short of the end so the count can never finish before the image does
const HOLD = 0.9;
// the bloom stops spreading here while waiting, leaving arrival somewhere to go
const WAIT_CAP = 0.82;
const EASE_RATE = 5.5;
const SPREAD_RATE = 4;
// a tab left in the background hands back one huge delta on its first frame
const MAX_DT = 0.05;

const RESOLVE_MS = 900;
const PHOTO_FROM = 0.86;
// spread of the per-dot head start that carries the bloom into the picture
const STAGGER = 0.4;

const EDGE = 0.74;
const BAND = 0.55;
const PEAK_FROM = 0.85;
// the orbits swell and the floor under them rises, so coverage grows without the threshold moving
const BLOOM = 0.9;
const RISE = 0.8;
// held back from linear so the grid does not fill before the image has a chance to land
const RISE_POW = 1.2;
const SPIN = 0.55;
// the orbit winds down as the picture resolves instead of racing under it
const SETTLE = 0.8;

// three blobs circling at their own radius and speed, the thinking figure the matrix orb draws
const ORBITERS = [
  { radius: 0.62, speed: 2.2, phase: 0, spread: 0.42 },
  { radius: 0.4, speed: -1.7, phase: 2.1, spread: 0.36 },
  { radius: 0.8, speed: 1.15, phase: 4, spread: 0.34 },
];

const DOT_MIN = 0.055;
const DOT_GROW = 0.075;

const SHIMMER = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.45) 60%)",
  backgroundSize: "250% 100%",
} as const;

type Rgb = [number, number, number];

type Palette = { bg: Rgb; dim: Rgb; lit: Rgb; hot: Rgb };

const DARK: Palette = {
  bg: [10, 10, 10],
  dim: [33, 33, 38],
  lit: [45, 86, 178],
  hot: [122, 162, 255],
};

const LIGHT: Palette = {
  bg: [246, 246, 248],
  dim: [219, 219, 225],
  lit: [122, 152, 232],
  hot: [38, 76, 198],
};

// written as comparisons so NaN falls through to 0
const clamp01 = (n: number) => (n > 0 ? (n < 1 ? n : 1) : 0);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function coverRect(iw: number, ih: number, w: number, h: number) {
  const s = Math.max(w / iw, h / ih);
  return { dx: (w - iw * s) / 2, dy: (h - ih * s) / 2, dw: iw * s, dh: ih * s };
}

type Dot = {
  x: number;
  y: number;
  cx: number;
  cy: number;
  rgb: Rgb;
  order: number;
};

type Grid = { dots: Dot[]; cols: number; rows: number; pitch: number };

function buildGrid(
  width: number,
  height: number,
  spacing: number,
  dpr: number,
) {
  const step = Math.max(6, spacing) * dpr;
  const cols = Math.max(2, Math.round(width / step));
  const rows = Math.max(2, Math.round(height / step));
  const sx = width / cols;
  const sy = height / rows;
  const dots: Dot[] = [];

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      dots.push({
        x: (i + 0.5) * sx,
        y: (j + 0.5) * sy,
        cx: ((i + 0.5) / cols) * 2 - 1,
        cy: ((j + 0.5) / rows) * 2 - 1,
        rgb: [0, 0, 0],
        order: 0,
      });
    }
  }

  return { dots, cols, rows, pitch: Math.min(sx, sy) } satisfies Grid;
}

type Field = { kx: number; ky: number; grow: number; rise: number };

// the two scales multiply to 1 and divide to the aspect, so blobs stay round and cover the same share of any frame
function fieldFor(ratio: number, spread: number): Field {
  const k = Math.sqrt(ratio);
  return {
    kx: k,
    ky: 1 / k,
    grow: 1 + BLOOM * spread,
    rise: RISE * Math.pow(spread, RISE_POW),
  };
}

function litAt(dot: Dot, f: Field, t: number) {
  let heat = 0;

  for (const o of ORBITERS) {
    const a = t * o.speed * SPIN + o.phase;
    const dx = (dot.cx - Math.cos(a) * o.radius) * f.kx;
    const dy = (dot.cy - Math.sin(a) * o.radius) * f.ky;
    const s = o.spread * f.grow;
    heat += Math.exp(-(dx * dx + dy * dy) / (s * s));
  }

  return smoothstep(EDGE, EDGE + BAND, heat + f.rise);
}

type Frame = {
  ratio: number;
  dark: boolean;
  clock: number;
  spread: number;
  fade: number;
  tinted: boolean;
  image: HTMLImageElement | null;
};

// the dots that lit first are the ones that resolve first
function grownAt(dot: Dot, fade: number) {
  if (fade <= 0) return 0;
  const head = STAGGER * (1 - dot.order);
  return clamp01((fade - head) / (1 - head));
}

// dim to accent, accent to the bloom's bright core, then across to the picture
const channelAt = (
  s: Palette,
  i: number,
  d: Dot,
  lit: number,
  peak: number,
  grown: number,
) =>
  Math.round(
    mix(mix(mix(s.dim[i], s.lit[i], lit), s.hot[i], peak), d.rgb[i], grown),
  );

function paintDots(ctx: CanvasRenderingContext2D, grid: Grid, frame: Frame) {
  const skin = frame.dark ? DARK : LIGHT;
  const tint = frame.tinted ? frame.fade : 0;
  const f = fieldFor(frame.ratio, frame.spread);
  const half = grid.pitch / 2;
  const rounded = typeof ctx.roundRect === "function";

  for (const dot of grid.dots) {
    const lit = litAt(dot, f, frame.clock);
    const peak = smoothstep(PEAK_FROM, 1, lit);
    const grown = grownAt(dot, tint);
    const size = mix(grid.pitch * (DOT_MIN + DOT_GROW * lit), half, grown);

    ctx.fillStyle = `rgb(${channelAt(skin, 0, dot, lit, peak, grown)},${channelAt(skin, 1, dot, lit, peak, grown)},${channelAt(skin, 2, dot, lit, peak, grown)})`;
    ctx.beginPath();
    // circles square off as they grow, so a filled grid has no diagonal gaps
    if (rounded) {
      const r = size * mix(1, 0.16, grown);
      ctx.roundRect(dot.x - size, dot.y - size, size * 2, size * 2, r);
    } else {
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

function paintPhoto(ctx: CanvasRenderingContext2D, frame: Frame) {
  const el = frame.image;
  if (!el) return;

  const alpha = frame.tinted
    ? smoothstep(PHOTO_FROM, 1, frame.fade)
    : frame.fade;
  if (alpha <= 0.002) return;

  const { width, height } = ctx.canvas;
  const fit = coverRect(el.naturalWidth, el.naturalHeight, width, height);
  ctx.globalAlpha = alpha;
  ctx.drawImage(el, fit.dx, fit.dy, fit.dw, fit.dh);
  ctx.globalAlpha = 1;
}

function paint(ctx: CanvasRenderingContext2D, grid: Grid, frame: Frame) {
  const bg = (frame.dark ? DARK : LIGHT).bg;
  ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  paintDots(ctx, grid, frame);
  paintPhoto(ctx, frame);
}

// one pixel per dot, so the grid lands on the picture's own colours
function sampleImage(grid: Grid, frame: Frame) {
  const el = frame.image;
  if (!el) return false;

  const buffer = document.createElement("canvas");
  buffer.width = grid.cols;
  buffer.height = grid.rows;
  const ctx = buffer.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const fit = coverRect(
    el.naturalWidth,
    el.naturalHeight,
    grid.cols,
    grid.rows,
  );
  ctx.drawImage(el, fit.dx, fit.dy, fit.dw, fit.dh);

  try {
    const { data } = ctx.getImageData(0, 0, grid.cols, grid.rows);
    const f = fieldFor(frame.ratio, frame.spread);
    grid.dots.forEach((dot, i) => {
      dot.rgb = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
      dot.order = litAt(dot, f, frame.clock);
    });
    return true;
  } catch {
    return false;
  }
}

function createSurface(
  canvas: HTMLCanvasElement,
  shell: HTMLElement,
  spacing: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let grid = buildGrid(canvas.width, canvas.height, spacing, 1);
  let sized = false;

  return {
    get grid() {
      return grid;
    },
    // true when the grid was rebuilt, so the caller knows to sample colours again
    fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = shell.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (sized && w === canvas.width && h === canvas.height) return false;
      sized = true;
      canvas.width = w;
      canvas.height = h;
      grid = buildGrid(w, h, spacing, dpr);
      return true;
    },
    paint(frame: Frame) {
      paint(ctx, grid, frame);
    },
  };
}

function loadPhoto(
  url: string,
  onReady: (el: HTMLImageElement) => void,
  onFail: () => void,
) {
  let cancelled = false;

  const attempt = (withCors: boolean) => {
    const el = new Image();
    if (withCors) el.crossOrigin = "anonymous";
    el.decoding = "async";
    el.onload = () => {
      if (cancelled) return;
      if (el.naturalWidth && el.naturalHeight) onReady(el);
      else onFail();
    };
    // hosts without CORS headers reject the request, so retry plainly
    el.onerror = () => {
      if (cancelled) return;
      if (withCors) attempt(false);
      else onFail();
    };
    el.src = url;
  };

  attempt(true);
  return () => {
    cancelled = true;
  };
}

// jsdom and older browsers lack these, so the component degrades instead of throwing
function observeSize(el: Element, onChange: () => void) {
  const o =
    typeof ResizeObserver === "function" ? new ResizeObserver(onChange) : null;
  o?.observe(el);
  return () => o?.disconnect();
}

function observeView(el: Element, onChange: (visible: boolean) => void) {
  const o =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), {
          rootMargin: "150px",
        })
      : null;
  o?.observe(el);
  return () => o?.disconnect();
}

type Pacer = { elapsed: number; eased: number; spread: number };

// never reaches its ceiling, so a job that outruns the estimate keeps creeping
function selfPaced(elapsed: number, duration: number) {
  const span = duration > 0 ? duration : 1;
  return HOLD * (1 - Math.exp(-elapsed / span));
}

function stepPacer(
  p: Pacer,
  dt: number,
  ready: boolean,
  progress: number | undefined,
  duration: number,
) {
  p.elapsed += dt;

  // the count cannot reach the end until the image is in hand, whatever progress claims
  const target = ready
    ? 1
    : progress === undefined
      ? selfPaced(p.elapsed * 1000, duration)
      : Math.min(clamp01(progress), HOLD);

  p.eased += (target - p.eased) * (1 - Math.exp(-dt * EASE_RATE));
  const wanted = Math.min(p.eased, ready ? 1 : WAIT_CAP);
  p.spread += (wanted - p.spread) * (1 - Math.exp(-dt * SPREAD_RATE));
}

export function DotReveal({
  src,
  alt = "",
  progress,
  aspect = 1,
  caption,
  spacing = 22,
  showPercent = true,
  estimatedDuration = 6000,
  onRevealComplete,
  onError,
  className,
  ...props
}: DotRevealProps) {
  const reduce = useReducedMotion();
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setLoaded(false);
    setRevealed(false);
  }

  const progressRef = useRef(progress);
  const durationRef = useRef(estimatedDuration);
  const doneRef = useRef(onRevealComplete);
  const errorRef = useRef(onError);

  useEffect(() => {
    progressRef.current = progress;
    durationRef.current = estimatedDuration;
    doneRef.current = onRevealComplete;
    errorRef.current = onError;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;

    const surface = createSurface(canvas, shell, spacing);
    if (!surface) return;

    const frame: Frame = {
      ratio,
      dark: false,
      clock: 0,
      spread: 0,
      fade: 0,
      tinted: false,
      image: null,
    };

    // the picture only starts resolving once the count has read 100
    let resolveAt = -1;

    const fadeAt = (now: number) =>
      resolveAt < 0 ? 0 : smoothstep(0, RESOLVE_MS, now - resolveAt);

    const paintAt = (spread: number, fade: number) => {
      frame.dark = document.documentElement.classList.contains("dark");
      frame.spread = spread;
      frame.fade = fade;
      surface.paint(frame);
    };

    // reduced motion has no loop, so hold one frame: the picture, or a mid bloom
    const settled = () => (frame.image ? paintAt(1, 1) : paintAt(0.45, 0));

    const resize = () => {
      if (!surface.fit()) return;
      // a new grid has no sampled colours, so take them again
      if (frame.image) frame.tinted = sampleImage(surface.grid, frame);
      if (reduce) settled();
      else paintAt(frame.spread, fadeAt(performance.now()));
    };

    resize();
    const stopSizing = observeSize(shell, resize);

    const cancelLoad = src
      ? loadPhoto(
          src,
          (el) => {
            frame.image = el;
            frame.tinted = sampleImage(surface.grid, frame);
            setLoaded(true);
            if (reduce) settled();
          },
          () => errorRef.current?.(),
        )
      : null;

    if (reduce) {
      settled();
      return () => {
        cancelLoad?.();
        stopSizing();
      };
    }

    const pace: Pacer = { elapsed: 0, eased: 0, spread: 0 };
    let frameId = 0;
    let last = 0;
    let spun = 0;
    let shown = -1;
    let fired = false;
    let visible = true;

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;

      const ready = frame.image !== null;
      spun += dt * (1 - SETTLE * fadeAt(now));
      frame.clock = spun;

      stepPacer(pace, dt, ready, progressRef.current, durationRef.current);
      paintAt(pace.spread, fadeAt(now));

      // repainting one text node beats re-rendering the tree sixty times a second
      const count = Math.round(clamp01(pace.eased) * 100);
      if (count !== shown) {
        shown = count;
        if (percentRef.current) percentRef.current.textContent = `${count}%`;
      }

      if (resolveAt < 0 && ready && count >= 100) resolveAt = now;

      if (!fired && resolveAt >= 0 && now - resolveAt > RESOLVE_MS) {
        fired = true;
        setRevealed(true);
        doneRef.current?.();
      }

      // nothing moves after this, so stop burning frames
      if (fired) {
        paintAt(1, 1);
        cancelAnimationFrame(frameId);
      }
    };

    const start = () => {
      if (fired) return;
      last = 0;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(tick);
    };

    // no reason to animate a frame nobody is looking at
    const stopWatching = observeView(shell, (seen) => {
      if (seen === visible) return;
      visible = seen;
      if (seen) start();
      else cancelAnimationFrame(frameId);
    });

    start();

    return () => {
      cancelLoad?.();
      cancelAnimationFrame(frameId);
      stopSizing();
      stopWatching();
    };
  }, [reduce, src, ratio, spacing]);

  useEffect(() => {
    if (reduce && loaded) doneRef.current?.();
  }, [reduce, loaded]);

  const finished = reduce ? loaded : revealed;

  // with no loop to count, the only honest numbers are the one passed in and the finished one
  const still =
    progress !== undefined
      ? Math.round(clamp01(progress) * 100)
      : loaded
        ? 100
        : null;
  const counting = showPercent && (!reduce || still !== null);

  return (
    <div
      data-slot="dot-reveal"
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    >
      {caption ? (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={caption}
            className={cn(
              "text-base font-medium leading-6 tracking-tight",
              reduce ? "text-foreground/70" : "bg-clip-text text-transparent",
            )}
            style={reduce ? undefined : SHIMMER}
            initial={{ opacity: 0 }}
            animate={{
              opacity: finished ? 0 : 1,
              ...(reduce || finished
                ? {}
                : { backgroundPosition: ["105% 0%", "-5% 0%"] }),
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduce ? 0 : 0.28,
              ease: [0.4, 0, 0.2, 1],
              backgroundPosition: {
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: [0.45, 0, 0.55, 1],
              },
            }}
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      ) : null}

      <div
        ref={shellRef}
        className="relative w-full overflow-hidden rounded-2xl bg-muted [corner-shape:squircle]"
        style={{ aspectRatio: ratio }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          {...(alt
            ? { role: "img", "aria-label": alt }
            : { "aria-hidden": true })}
        />

        {counting ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-3 flex h-7 items-center rounded-full bg-black/45 px-3 backdrop-blur-md"
            animate={{ opacity: finished ? 0 : 1 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <span
              ref={percentRef}
              className="text-[13px] font-medium leading-7 tabular-nums text-white"
            >
              {reduce ? `${still}%` : "0%"}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export default DotReveal;
