"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils";

const GLOW: Transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
const ICON: Transition = { type: "spring", duration: 0.34, bounce: 0.2 };
const TAP: Transition = { type: "spring", duration: 0.25, bounce: 0.3 };
const INSTANT: Transition = { duration: 0 };

const PLAYING_GLOW = 0.7;

// all proportional to the bar height, so every size keeps the same look
const CONTROL_RATIO = 0.76;
const ICON_RATIO = 0.72;
const BLUR_RATIO = 0.32;
const PEAK_RATIO = 0.68;

const PULSE_SPEED = 0.6;

// seconds for the orbit to reach full speed, and to coast back down
const SPIN_UP = 0.45;

// each light is centred on the outline so the clip keeps its inner half; all travel the same way,
// at their own lap in seconds, so they drift apart and bunch up without ever crossing back
const BLOBS = [
  { size: 2, alpha: 0.5, lap: 11, offset: 0.06, pulse: 0.12 },
  { size: 1.5, alpha: 0.4, lap: 17, offset: 0.3, pulse: 0.14 },
  { size: 2.3, alpha: 0.45, lap: 23, offset: 0.55, pulse: 0.1 },
  { size: 1.2, alpha: 0.35, lap: 13, offset: 0.8, pulse: 0.16 },
] as const;

// walks the outline of a pill: top edge, right cap, bottom edge, left cap
const pointOnPill = (distance: number, width: number, height: number) => {
  const radius = height / 2;
  const straight = Math.max(0, width - height);
  const arc = Math.PI * radius;
  const perimeter = 2 * straight + 2 * arc;

  let d = distance % perimeter;
  if (d < 0) d += perimeter;

  if (d < straight) return [radius + d, 0];
  d -= straight;
  if (d < arc) {
    const a = -Math.PI / 2 + d / radius;
    return [
      width - radius + radius * Math.cos(a),
      radius + radius * Math.sin(a),
    ];
  }
  d -= arc;
  if (d < straight) return [width - radius - d, height];
  d -= straight;
  const a = Math.PI / 2 + d / radius;
  return [radius + radius * Math.cos(a), radius + radius * Math.sin(a)];
};

// both icons are two four-point quads wound the same way, so the morph is a plain lerp: the triangle
// is split down the middle and its right quad collapses to the tip
const PLAY_SHAPE = [
  7.7, 5.8, 13, 8.9, 13, 15.1, 7.7, 18.2, 13, 8.9, 18.3, 12, 18.3, 12, 13, 15.1,
];
const PAUSE_SHAPE = [
  8.2, 6.8, 10.9, 6.8, 10.9, 17.2, 8.2, 17.2, 13.1, 6.8, 15.8, 6.8, 15.8, 17.2,
  13.1, 17.2,
];

const toPath = (shape: number[]) => {
  let d = "";
  for (let quad = 0; quad < shape.length; quad += 8) {
    d += `M${shape[quad]} ${shape[quad + 1]}`;
    for (let point = 2; point < 8; point += 2) {
      d += ` L${shape[quad + point]} ${shape[quad + point + 1]}`;
    }
    d += " Z";
  }
  return d;
};

const morph = (from: number[], to: number[], t: number) =>
  toPath(from.map((value, i) => value + (to[i] - value) * t));

const PLAY_PATH = toPath(PLAY_SHAPE);
const PAUSE_PATH = toPath(PAUSE_SHAPE);

// stroke rounds the corners the path leaves sharp
const ICON_PAINT = {
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

const SIZES = {
  sm: { height: 40, gap: 8, bar: 2, barGap: 2, pad: 12, text: "text-[11px]" },
  md: { height: 52, gap: 10, bar: 3, barGap: 3, pad: 14, text: "text-xs" },
  lg: { height: 64, gap: 12, bar: 3, barGap: 4, pad: 16, text: "text-sm" },
} as const;

const SEEK_STEP = 5;
const MIN_AMPLITUDE = 0.14;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const formatTime = (seconds: number) => {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

// deterministic, so the server and the client draw the same bars
const buildWaveform = (count: number, seed: number) => {
  let state = (seed >>> 0) + 0x9e3779b9;
  return Array.from({ length: count }, (_, i) => {
    state = (state * 1664525 + 1013904223) >>> 0;
    const noise = state / 0x100000000;
    const envelope = Math.sin((Math.PI * (i + 0.5)) / count) ** 0.55;
    const swell = 0.5 + 0.5 * Math.sin(i * 0.9 + seed);
    return clamp(
      envelope * (0.3 + 0.5 * noise + 0.2 * swell),
      MIN_AMPLITUDE,
      1,
    );
  });
};

export type VoiceNoteProps = Omit<ComponentProps<"div">, "onEnded"> & {
  src?: string;
  duration?: number;
  waveform?: number[];
  bars?: number;
  seed?: number;
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onEnded?: () => void;
  accent?: string;
  size?: keyof typeof SIZES;
  seekable?: boolean;
};

function VoiceNote({
  src,
  duration = 53,
  waveform,
  bars = 40,
  seed = 7,
  playing,
  defaultPlaying = false,
  onPlayingChange,
  onEnded,
  accent = "#FC4C01",
  size = "md",
  seekable = true,
  className,
  ...props
}: VoiceNoteProps) {
  const metrics = SIZES[size];
  const control = Math.round(metrics.height * CONTROL_RATIO);
  // the control sits as far from the left edge as it does from the top and bottom
  const inset = Math.round((metrics.height - control) / 2);
  const shouldReduceMotion = useReducedMotion();

  const amplitudes = useMemo(
    () => waveform ?? buildWaveform(Math.max(1, bars), seed),
    [waveform, bars, seed],
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  // performance.now() baseline for the clip that has no audio file behind it
  const startedAt = useRef(0);

  const [metaDuration, setMetaDuration] = useState<number | null>(null);
  const [playingState, setPlayingState] = useState(defaultPlaying);
  const [elapsed, setElapsed] = useState(0);

  const total = metaDuration ?? duration;
  const isControlled = playing !== undefined;
  const isPlaying = isControlled ? playing : playingState;

  const progress = useMotionValue(0);
  const clipPath = useTransform(
    progress,
    (p) => `inset(0 ${(1 - p) * 100}% 0 0)`,
  );

  // a new callback identity would otherwise restart the running clip
  const callbacks = useRef({ onEnded, onPlayingChange });
  useEffect(() => {
    callbacks.current = { onEnded, onPlayingChange };
  }, [onEnded, onPlayingChange]);

  const commitPlaying = useCallback(
    (next: boolean) => {
      if (!isControlled) setPlayingState(next);
      callbacks.current.onPlayingChange?.(next);
    },
    [isControlled],
  );

  const seekTo = useCallback(
    (ratio: number) => {
      const next = clamp(ratio);
      progress.set(next);
      setElapsed(Math.floor(next * total));
      startedAt.current = performance.now() - next * total * 1000;
      const audio = audioRef.current;
      if (audio && Number.isFinite(total)) audio.currentTime = next * total;
    },
    [progress, total],
  );

  const reset = useCallback(() => {
    progress.set(0);
    setElapsed(0);
    const audio = audioRef.current;
    if (audio) audio.currentTime = 0;
    commitPlaying(false);
    callbacks.current.onEnded?.();
  }, [progress, commitPlaying]);

  useEffect(() => {
    if (!isPlaying || total <= 0) return;

    const audio = audioRef.current;
    audio?.play().catch(() => commitPlaying(false));
    startedAt.current = performance.now() - progress.get() * total * 1000;

    let frame = 0;
    const tick = (now: number) => {
      const seconds = audio
        ? audio.currentTime
        : (now - startedAt.current) / 1000;
      const ratio = clamp(seconds / total);
      progress.set(ratio);
      // whole seconds only, so the label is the one thing that re-renders
      setElapsed(Math.floor(seconds));
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      reset();
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      audio?.pause();
    };
  }, [isPlaying, total, progress, commitPlaying, reset]);

  const scrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect?.width) seekTo((event.clientX - rect.left) / rect.width);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!seekable) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubbing.current = true;
    scrub(event);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!seekable || total <= 0) return;
    const at = progress.get() * total;
    const to = {
      ArrowLeft: at - SEEK_STEP,
      ArrowRight: at + SEEK_STEP,
      Home: 0,
      End: total,
    }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    seekTo(to / total);
  };

  const remaining = total - elapsed;
  const slider = seekable && {
    role: "slider" as const,
    tabIndex: 0,
    "aria-label": "Seek",
    "aria-valuemin": 0,
    "aria-valuemax": Math.round(total),
    "aria-valuenow": elapsed,
    "aria-valuetext": `${formatTime(elapsed)} of ${formatTime(total)}`,
  };
  const glow = isPlaying ? PLAYING_GLOW : 0;

  return (
    <div
      data-slot="voice-note"
      data-playing={isPlaying || undefined}
      className={cn(
        "relative isolate inline-flex select-none items-center",
        className,
      )}
      style={{
        height: metrics.height,
        gap: metrics.gap,
        paddingLeft: inset,
        paddingRight: metrics.pad,
      }}
      {...props}
    >
      <div className="absolute inset-0 -z-10 rounded-full bg-[#F4F4F9] dark:bg-[#1C1C1C]" />
      <Aurora
        accent={accent}
        height={metrics.height}
        glow={glow}
        playing={isPlaying}
        reduced={!!shouldReduceMotion}
      />

      <motion.button
        data-slot="voice-note-control"
        type="button"
        onClick={() => commitPlaying(!isPlaying)}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
        transition={shouldReduceMotion ? INSTANT : TAP}
        style={{ width: control, height: control }}
        className="z-10 flex shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-white text-black outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#868593] dark:bg-[#0E0E0E] dark:text-white"
      >
        <TransportIcon
          playing={isPlaying}
          size={Math.round(control * ICON_RATIO)}
          reduced={!!shouldReduceMotion}
        />
      </motion.button>

      <div
        ref={trackRef}
        data-slot="voice-note-track"
        {...(slider || {})}
        onPointerDown={handlePointerDown}
        onPointerMove={(event) => scrubbing.current && scrub(event)}
        onPointerUp={() => (scrubbing.current = false)}
        onPointerCancel={() => (scrubbing.current = false)}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative h-full flex-1 touch-none rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#868593]",
          seekable && "cursor-pointer",
        )}
      >
        <Bars
          amplitudes={amplitudes}
          metrics={metrics}
          className="bg-[#868593]/60"
        />
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ clipPath }}
        >
          <Bars
            amplitudes={amplitudes}
            metrics={metrics}
            className="bg-black dark:bg-white"
          />
        </motion.div>
      </div>

      <span
        data-slot="voice-note-time"
        className={cn(
          "shrink-0 font-semibold tabular-nums text-[#868593]",
          metrics.text,
        )}
      >
        {formatTime(remaining)}
      </span>

      {src && (
        <audio
          ref={audioRef}
          className="hidden"
          src={src}
          preload="metadata"
          onLoadedMetadata={(event) => {
            const value = event.currentTarget.duration;
            if (Number.isFinite(value)) setMetaDuration(value);
          }}
          // a file can stop just short of its own duration, so the frame loop may never reach the end
          onEnded={reset}
        />
      )}
    </div>
  );
}

function Aurora({
  accent,
  height,
  glow,
  playing,
  reduced,
}: {
  accent: string;
  height: number;
  glow: number;
  playing: boolean;
  reduced: boolean;
}) {
  // lap time, advanced only while the clip runs, so pausing leaves every light where it is
  const clock = useRef(0);
  const rate = useRef(0);
  const fieldRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const width = useRef(0);

  const place = useCallback(
    (t: number) => {
      if (width.current === 0) return;
      const perimeter =
        2 * Math.max(0, width.current - height) + Math.PI * height;

      BLOBS.forEach((blob, i) => {
        const node = nodes.current[i];
        if (!node) return;
        const travelled = blob.offset + t / blob.lap;
        const [x, y] = pointOnPill(
          travelled * perimeter,
          width.current,
          height,
        );
        const phase = blob.offset * Math.PI * 2;
        const scale = 1 + Math.sin(t * PULSE_SPEED + phase) * blob.pulse;
        node.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      });
    },
    [height],
  );

  useEffect(() => {
    const node = fieldRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      width.current = entry.contentRect.width;
      // place them at once, so a resize or a reduced motion viewer never sees them stacked
      place(clock.current);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [place]);

  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      // a long frame gap, from a background tab, must not throw the lights across the bar
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = playing ? 1 : 0;
      rate.current +=
        (target - rate.current) * (1 - Math.exp(-delta / SPIN_UP));
      clock.current += delta * rate.current;
      place(clock.current);

      if (playing || rate.current > 0.002) {
        frame = requestAnimationFrame(loop);
        return;
      }
      rate.current = 0;
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, reduced, place]);

  return (
    <div
      data-slot="voice-note-glow"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full opacity-70 dark:opacity-100 dark:mix-blend-screen"
    >
      <motion.div
        ref={fieldRef}
        aria-hidden
        className="absolute inset-0"
        style={{ filter: `blur(${height * BLUR_RATIO}px)` }}
        animate={{ opacity: glow }}
        transition={reduced ? INSTANT : GLOW}
      >
        <span
          className="absolute inset-0"
          style={{
            background: `radial-gradient(70% 170% at 8% 115%, ${accent} 0%, transparent 62%), radial-gradient(55% 150% at 40% 130%, ${accent} 0%, transparent 58%)`,
          }}
        />
        {BLOBS.map((blob, i) => (
          <span
            key={i}
            ref={(node) => {
              nodes.current[i] = node;
            }}
            className="absolute left-0 top-0 rounded-full"
            style={{
              width: blob.size * height,
              height: blob.size * height,
              marginLeft: (-blob.size * height) / 2,
              marginTop: (-blob.size * height) / 2,
              background: accent,
              opacity: blob.alpha,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function TransportIcon({
  playing,
  size,
  reduced,
}: {
  playing: boolean;
  size: number;
  reduced: boolean;
}) {
  const shape = useMotionValue(playing ? PAUSE_PATH : PLAY_PATH);
  const previous = useRef(playing);

  useEffect(() => {
    if (previous.current === playing) return;
    previous.current = playing;
    shape.set(playing ? PAUSE_PATH : PLAY_PATH);
    if (reduced) return;

    const from = playing ? PLAY_SHAPE : PAUSE_SHAPE;
    const to = playing ? PAUSE_SHAPE : PLAY_SHAPE;
    const controls = animate(0, 1, {
      ...ICON,
      onUpdate: (t) => shape.set(morph(from, to, clamp(t))),
      // the spring can overshoot, so land on the exact path
      onComplete: () => shape.set(playing ? PAUSE_PATH : PLAY_PATH),
    });
    return () => controls.stop();
  }, [playing, reduced, shape]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
    >
      <motion.path d={shape} {...ICON_PAINT} />
    </svg>
  );
}

function Bars({
  amplitudes,
  metrics,
  className,
}: {
  amplitudes: number[];
  metrics: (typeof SIZES)[keyof typeof SIZES];
  className: string;
}) {
  return (
    <div
      className="flex h-full w-full items-center"
      style={{ gap: metrics.barGap }}
    >
      {amplitudes.map((amplitude, i) => (
        <span
          key={i}
          className={cn("flex-1 rounded-full", className)}
          style={{
            minWidth: metrics.bar,
            height: `${amplitude * PEAK_RATIO * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export { VoiceNote };
export default VoiceNote;
