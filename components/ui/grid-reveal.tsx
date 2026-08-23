"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type GridRevealProps = Omit<ComponentProps<"div">, "children"> & {
  src?: string | null;
  alt?: string;
  progress?: number;
  aspect?: number;
  caption?: string;
  estimatedDuration?: number;
  onRevealComplete?: () => void;
  onError?: () => void;
};

const CELLS = 180;
const OPENING_CELLS = 4;
// hold short of the end so the run can never finish before the image does
const HOLD = 0.9;
// the grid stops splitting here while waiting, leaving arrival somewhere to go
const WAIT_CAP = 0.72;
const LAST_SPLIT = 0.92;
// how long one cell takes to separate, in progress units
const MORPH = 0.055;
const SAMPLE = 128;
const COLOR_MS = 420;
const GUTTER_FROM = 0.35;
const GUTTER_TO = 0.75;
const PHOTO_FROM = 0.93;

const SHIMMER = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.5) 60%)",
  backgroundSize: "250% 100%",
} as const;

type Cell = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  g: number;
  b: number;
  tone: number;
  detail: number;
  splitAt: number;
  parent: Cell | null;
  kids: [Cell, Cell] | null;
};

type Sums = {
  n: number;
  r: number;
  g: number;
  b: number;
  l: number;
  l2: number;
};

// written as comparisons so NaN falls through to 0
const clamp01 = (n: number) => (n > 0 ? (n < 1 ? n : 1) : 0);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

// never reaches its ceiling, so a job that outruns the estimate keeps creeping
function selfPaced(elapsed: number, duration: number) {
  const span = duration > 0 ? duration : 1;
  return HOLD * (1 - Math.exp(-elapsed / span));
}

function hash(x: number, y: number, z: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function makeCell(
  x: number,
  y: number,
  w: number,
  h: number,
  parent: Cell | null,
): Cell {
  return {
    x,
    y,
    w,
    h,
    r: 0,
    g: 0,
    b: 0,
    tone: hash(x + 3.1, y + 1.7, w * 31.7),
    detail: 0,
    splitAt: 0,
    parent,
    kids: null,
  };
}

// splitting the biggest cell each time keeps cells square and the count rising one at a time
function buildTree(aspect: number) {
  const root = makeCell(0, 0, 1, 1, null);
  const leaves: Cell[] = [root];
  const branches: Cell[] = [];

  while (leaves.length < CELLS) {
    let pick = 0;
    let widest = -1;
    for (let i = 0; i < leaves.length; i++) {
      const c = leaves[i];
      // the jitter only breaks ties between cells of equal size
      const area = c.w * aspect * c.h * (1 + 0.12 * hash(c.x, c.y, 7.3));
      if (area > widest) {
        widest = area;
        pick = i;
      }
    }

    const parent = leaves.splice(pick, 1)[0];
    const wide = parent.w * aspect >= parent.h;
    const half = wide ? parent.w / 2 : parent.h / 2;
    const a = wide
      ? makeCell(parent.x, parent.y, half, parent.h, parent)
      : makeCell(parent.x, parent.y, parent.w, half, parent);
    const b = wide
      ? makeCell(parent.x + half, parent.y, half, parent.h, parent)
      : makeCell(parent.x, parent.y + half, parent.w, half, parent);

    parent.kids = [a, b];
    branches.push(parent);
    leaves.push(a, b);
  }

  const opening = OPENING_CELLS - 1;
  const rest = Math.max(1, branches.length - opening);
  // the opening splits sit before zero so those cells are already apart on frame one
  branches.forEach((cell, i) => {
    cell.splitAt =
      i < opening ? -MORPH : (LAST_SPLIT * (i - opening + 1)) / rest;
  });

  return { root, branches };
}

// average colour per cell, plus the luminance spread that decides what splits first
function measureTree(root: Cell, pixels: Uint8ClampedArray, size: number) {
  const gather = (cell: Cell): Sums => {
    let s: Sums;

    if (cell.kids) {
      const a = gather(cell.kids[0]);
      const b = gather(cell.kids[1]);
      s = {
        n: a.n + b.n,
        r: a.r + b.r,
        g: a.g + b.g,
        b: a.b + b.b,
        l: a.l + b.l,
        l2: a.l2 + b.l2,
      };
    } else {
      s = { n: 0, r: 0, g: 0, b: 0, l: 0, l2: 0 };
      const x0 = Math.round(cell.x * size);
      const y0 = Math.round(cell.y * size);
      const x1 = Math.max(x0 + 1, Math.round((cell.x + cell.w) * size));
      const y1 = Math.max(y0 + 1, Math.round((cell.y + cell.h) * size));

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * size + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const l = 0.299 * r + 0.587 * g + 0.114 * b;
          s.n++;
          s.r += r;
          s.g += g;
          s.b += b;
          s.l += l;
          s.l2 += l * l;
        }
      }
    }

    const n = s.n || 1;
    cell.r = s.r / n;
    cell.g = s.g / n;
    cell.b = s.b / n;
    cell.detail = Math.max(0, s.l2 / n - (s.l / n) * (s.l / n));
    return s;
  };

  gather(root);
}

// reuse the same time slots so only the order changes and the pacing stays identical
function orderByDetail(branches: Cell[], openedBefore: number) {
  const pending = branches.filter((c) => c.splitAt > openedBefore);
  if (pending.length < 2) return;

  const slots = pending.map((c) => c.splitAt).sort((a, b) => a - b);
  const queue = pending.filter(
    (c) => !c.parent || c.parent.splitAt <= openedBefore,
  );

  let next = 0;
  while (queue.length && next < slots.length) {
    let pick = 0;
    for (let i = 1; i < queue.length; i++) {
      if (queue[i].detail > queue[pick].detail) pick = i;
    }
    const cell = queue.splice(pick, 1)[0];
    cell.splitAt = slots[next++];
    for (const kid of cell.kids ?? []) {
      if (kid.kids) queue.push(kid);
    }
  }
}

function coverRect(iw: number, ih: number, w: number, h: number) {
  const s = Math.max(w / iw, h / ih);
  return { dx: (w - iw * s) / 2, dy: (h - ih * s) / 2, dw: iw * s, dh: ih * s };
}

type Scene = {
  ctx: CanvasRenderingContext2D;
  root: Cell;
  width: number;
  height: number;
  scale: number;
  dark: boolean;
  clock: number;
  split: number;
  fade: number;
  hasColors: boolean;
  image: HTMLImageElement | null;
};

function greyOf(tone: number, dark: boolean, clock: number) {
  return (
    (dark ? 30 : 228) + tone * 13 + Math.sin(clock * 1.5 + tone * 6.28) * 3
  );
}

type Patch = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  g: number;
  b: number;
  tone: number;
};

function drawScene(s: Scene) {
  const { ctx, root, width, height, split } = s;
  // without pixel access the grid stays grey, but the photo still fades in below
  const tint = s.hasColors ? s.fade : 0;
  const shade = (grey: number, target: number) =>
    Math.round(mix(grey, target, tint));
  const base = greyOf(root.tone, s.dark, s.clock);

  // gutters recess into this instead of cutting through to the surface behind
  ctx.fillStyle = `rgb(${Math.round(shade(base, root.r) * 0.92)},${Math.round(
    shade(base, root.g) * 0.92,
  )},${Math.round(shade(base, root.b) * 0.92)})`;
  ctx.fillRect(0, 0, width, height);

  const soft = 1 - smoothstep(GUTTER_FROM, GUTTER_TO, split);
  const gutter = s.scale * soft;
  const rounded = soft > 0.01 && typeof ctx.roundRect === "function";

  const paint = (p: Patch) => {
    // snap to whole pixels so neighbouring cells stay flush with no seam
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const w = Math.round(p.x + p.w) - x;
    const h = Math.round(p.y + p.h) - y;

    const onLeft = x <= 0;
    const onTop = y <= 0;
    const onRight = x + w >= width;
    const onBottom = y + h >= height;

    // only interior edges get a gutter, so the outer silhouette stays the frame
    const left = onLeft ? 0 : gutter;
    const top = onTop ? 0 : gutter;
    const innerW = w - left - (onRight ? 0 : gutter);
    const innerH = h - top - (onBottom ? 0 : gutter);
    if (innerW <= 0 || innerH <= 0) return;

    const grey = greyOf(p.tone, s.dark, s.clock);
    ctx.fillStyle = `rgb(${shade(grey, p.r)},${shade(grey, p.g)},${shade(grey, p.b)})`;

    if (rounded) {
      const radius = Math.min(innerW, innerH) * 0.12 * soft;
      ctx.beginPath();
      ctx.roundRect(x + left, y + top, innerW, innerH, [
        !onLeft && !onTop ? radius : 0,
        !onRight && !onTop ? radius : 0,
        !onRight && !onBottom ? radius : 0,
        !onLeft && !onBottom ? radius : 0,
      ]);
      ctx.fill();
    } else {
      ctx.fillRect(x + left, y + top, innerW, innerH);
    }
  };

  const walk = (cell: Cell, p: Patch) => {
    if (!cell.kids || split < cell.splitAt) {
      paint(p);
      return;
    }
    // children start on the parent's rect and separate into their own
    const t = easeOut(clamp01((split - cell.splitAt) / MORPH));
    for (const kid of cell.kids) {
      walk(kid, {
        x: mix(p.x, kid.x * width, t),
        y: mix(p.y, kid.y * height, t),
        w: mix(p.w, kid.w * width, t),
        h: mix(p.h, kid.h * height, t),
        r: mix(p.r, kid.r, t),
        g: mix(p.g, kid.g, t),
        b: mix(p.b, kid.b, t),
        tone: mix(p.tone, kid.tone, t),
      });
    }
  };

  walk(root, {
    x: 0,
    y: 0,
    w: width,
    h: height,
    r: root.r,
    g: root.g,
    b: root.b,
    tone: root.tone,
  });

  if (!s.image) return;
  const photo = s.hasColors
    ? smoothstep(PHOTO_FROM, 1, split) * s.fade
    : s.fade;
  if (photo <= 0.002) return;

  const fit = coverRect(
    s.image.naturalWidth,
    s.image.naturalHeight,
    width,
    height,
  );
  ctx.globalAlpha = photo;
  ctx.drawImage(s.image, fit.dx, fit.dy, fit.dw, fit.dh);
  ctx.globalAlpha = 1;
}

function readAverages(
  el: HTMLImageElement,
  root: Cell,
  branches: Cell[],
  at: number,
) {
  const buffer = document.createElement("canvas");
  buffer.width = SAMPLE;
  buffer.height = SAMPLE;
  const ctx = buffer.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const fit = coverRect(el.naturalWidth, el.naturalHeight, SAMPLE, SAMPLE);
  ctx.drawImage(el, fit.dx, fit.dy, fit.dw, fit.dh);

  try {
    measureTree(root, ctx.getImageData(0, 0, SAMPLE, SAMPLE).data, SAMPLE);
    orderByDetail(branches, at);
    return true;
  } catch {
    return false;
  }
}

export function GridReveal({
  src,
  alt = "",
  progress,
  aspect = 1,
  caption,
  estimatedDuration = 6000,
  onRevealComplete,
  onError,
  className,
  style,
  ...props
}: GridRevealProps) {
  const reduce = useReducedMotion();
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { root, branches } = buildTree(ratio);

    const scene: Scene = {
      ctx,
      root,
      width: 0,
      height: 0,
      scale: 1,
      dark: false,
      clock: 0,
      split: 0,
      fade: 0,
      hasColors: false,
      image: null,
    };

    let loadedAt = -1;
    let cancelled = false;

    const render = (split: number, now: number) => {
      scene.dark = document.documentElement.classList.contains("dark");
      scene.split = split;
      scene.fade = loadedAt < 0 ? 0 : smoothstep(0, COLOR_MS, now - loadedAt);
      drawScene(scene);
    };

    const repaint = () => {
      if (!reduce) return render(scene.split, performance.now());
      // reduced motion has no loop, so jump straight to the settled frame
      const settled = loadedAt < 0 ? performance.now() : loadedAt + COLOR_MS;
      render(scene.image ? 1 : WAIT_CAP, settled);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = frame.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      scene.scale = dpr;
      if (w === scene.width && h === scene.height) return;
      scene.width = w;
      scene.height = h;
      canvas.width = w;
      canvas.height = h;
      // resizing the canvas clears it, so always paint again
      repaint();
    };

    resize();
    // jsdom and older browsers lack these, so the component degrades instead of throwing
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(frame);

    const load = (url: string, withCors: boolean) => {
      const el = new Image();
      if (withCors) el.crossOrigin = "anonymous";
      el.decoding = "async";
      el.onload = () => {
        if (cancelled) return;
        if (!el.naturalWidth || !el.naturalHeight) {
          errorRef.current?.();
          return;
        }
        scene.image = el;
        loadedAt = performance.now();
        scene.hasColors = readAverages(el, root, branches, scene.split);
        setLoaded(true);
        if (reduce) repaint();
      };
      // hosts without CORS headers reject the request, so retry plainly
      el.onerror = () => {
        if (cancelled) return;
        if (withCors) load(url, false);
        else errorRef.current?.();
      };
      el.src = url;
    };

    if (src) load(src, true);

    if (reduce) {
      repaint();
      return () => {
        cancelled = true;
        observer?.disconnect();
      };
    }

    let frameId = 0;
    let last = 0;
    let elapsed = 0;
    let eased = 0;
    let split = 0;
    let fired = false;
    let stopped = false;
    let visible = true;

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      scene.clock = elapsed;

      const ready = scene.image !== null;
      const paced = progressRef.current === undefined;
      let target: number;

      // the image landing is what finishes the run, not the number
      if (ready) {
        target = 1;
      } else if (paced) {
        target = selfPaced(elapsed * 1000, durationRef.current);
      } else {
        target = Math.min(clamp01(progressRef.current as number), HOLD);
      }

      eased += (target - eased) * (1 - Math.exp(-dt * 5.5));
      const wanted = Math.min(eased, ready ? 1 : WAIT_CAP);
      split += (wanted - split) * (1 - Math.exp(-dt * 4));
      render(split, now);

      if (!fired && ready && eased > 0.995 && now - loadedAt > COLOR_MS) {
        fired = true;
        setRevealed(true);
        doneRef.current?.();
      }

      // nothing moves after this, so stop burning frames
      if (fired && split > 0.9995) {
        render(1, now);
        stopped = true;
        cancelAnimationFrame(frameId);
      }
    };

    const start = () => {
      if (stopped) return;
      last = 0;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(tick);
    };

    // no reason to animate a frame nobody is looking at
    const visibility =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting === visible) return;
              visible = entry.isIntersecting;
              if (visible) start();
              else cancelAnimationFrame(frameId);
            },
            { rootMargin: "150px" },
          )
        : null;
    visibility?.observe(frame);

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      visibility?.disconnect();
    };
  }, [reduce, src, ratio]);

  useEffect(() => {
    if (reduce && loaded) doneRef.current?.();
  }, [reduce, loaded]);

  const finished = reduce ? loaded : revealed;

  return (
    <div
      ref={frameRef}
      data-slot="grid-reveal"
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-muted [corner-shape:squircle]",
        className,
      )}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        {...(alt
          ? { role: "img", "aria-label": alt }
          : { "aria-hidden": true })}
      />

      {caption ? (
        <motion.div
          layout
          className="pointer-events-none absolute bottom-3 left-3 flex h-6 items-center overflow-hidden bg-black/45 px-2.5 backdrop-blur-md"
          style={{ borderRadius: 9999 }}
          animate={{ opacity: finished ? 0 : 1 }}
          transition={{
            opacity: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
            layout: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={caption}
              layout="position"
              className={cn(
                "block whitespace-nowrap text-[11px] font-medium leading-6",
                reduce ? "text-white/75" : "bg-clip-text text-transparent",
              )}
              style={reduce ? undefined : SHIMMER}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
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
            </motion.span>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </div>
  );
}

export default GridReveal;
