"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDiwali } from "@/lib/diwali";
import { DIWALI_LIGHTS_ENABLED } from "@/lib/site";

const GARLAND = { y: -2, span: 360, depth: 66, spacing: 21 };
const CURTAIN = { strands: 7, compactStrands: 3, spacing: 19, inset: 24 };
const CHASE = 2.8;
const CHASE_STEP = 0.11;

const STAR =
  "M30 4L36.5 21.1L54.7 22L40.5 33.4L45.3 51L30 41L14.7 51L19.5 33.4L5.3 22L23.5 21.1Z";
const STAR_CORE =
  "M30 17L33.2 25.6L42.4 26L35.2 31.7L37.6 40.5L30 35.5L22.4 40.5L24.8 31.7L17.6 26L26.8 25.6Z";
const TAILS = [
  "M19 47C16 62 22 76 18 98",
  "M25 44C23 60 28 74 25 104",
  "M30 42C31 58 27 74 30 108",
  "M35 44C37 60 32 74 35 104",
  "M41 47C44 62 38 76 42 98",
];

type Light = {
  x: number;
  y: number;
  angle: number;
  scale: number;
  fade: number;
  power: number;
  chase: number;
  saffron: boolean;
};

type Strand = {
  d: string;
  delay: number;
  sway?: { origin: string; duration: number; phase: number };
  lights: Light[];
};

// deterministic so every render and resize lays the lights out the same way
function noise(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// pods stick out of the wire alternating sides, the way icicle string lights hang
function podAngle(seed: number, k: number) {
  const side = noise(seed + k * 0.37) > 0.82 ? -1 : 1;
  return (k % 2 === 0 ? 1 : -1) * side * (28 + noise(seed + k) * 48);
}

function buildStrands(width: number, height: number): Strand[] {
  const compact = width < 768;
  const count = compact ? CURTAIN.compactStrands : CURTAIN.strands;
  const region = compact ? width * 0.1 : Math.min(width * 0.15, 230);
  const strands: Strand[] = [];

  for (const side of [-1, 1]) {
    for (let j = 0; j < count; j++) {
      const t = count === 1 ? 0 : j / (count - 1);
      const offset = CURTAIN.inset + t * region;
      const x = side < 0 ? offset : width - offset;
      const seed = j * 13 + (side > 0 ? 100 : 0);
      // an eased falloff reads as a draped curtain instead of a staircase
      const length =
        height *
        (compact ? 0.32 : 0.64) *
        (1 - 0.62 * Math.pow(t, 0.8)) *
        (0.94 + 0.12 * noise(seed));
      // offsetting each strand's first light keeps neighbours from lining up into a grid
      const startY = 12 + noise(seed + 1) * CURTAIN.spacing * 0.9;
      const total = Math.floor((length - startY) / CURTAIN.spacing) + 1;
      const lights: Light[] = [];
      const phase = noise(seed + 4) * 6;
      const wobble = (y: number) => x + 1.6 * Math.sin(y / 46 + phase);
      let d = `M${wobble(0)} 0`;
      for (let y = 8; y < length; y += 8) d += `L${wobble(y).toFixed(2)} ${y}`;
      d += `L${wobble(length).toFixed(2)} ${length}`;

      for (let k = 0; k < total; k++) {
        const y = startY + k * CURTAIN.spacing;
        const progress = k / Math.max(1, total - 1);
        lights.push({
          x: wobble(y),
          y,
          angle: podAngle(seed * 3, k),
          scale: 1 - 0.18 * t,
          fade:
            (1 - 0.3 * t) *
            (progress > 0.6 ? 1 - ((progress - 0.6) / 0.4) * 0.9 : 1),
          power: 0.9 + (y / height) * 1.4 + t * 0.15,
          chase: ((total - k) * CHASE_STEP + t * 0.5) % CHASE,
          saffron: noise(seed * 7 + k) > 0.82,
        });
      }

      strands.push({
        d,
        delay: 0.3 + t * 0.2,
        sway: {
          origin: `${x}px 0px`,
          duration: 5 + noise(seed + 2) * 3,
          phase: noise(seed + 3) * 8,
        },
        lights,
      });
    }
  }

  const left = CURTAIN.inset + region;
  const run = width - left * 2;
  const swags = Math.max(2, Math.round(run / (compact ? 220 : GARLAND.span)));
  const span = run / swags;
  const top = GARLAND.y;
  let d = `M${left} ${top}`;
  const points: { x: number; y: number; slope: number }[] = [];
  for (let i = 0; i < swags; i++) {
    const x = left + i * span;
    const depth =
      (compact ? 0.6 : 1) * GARLAND.depth * (0.88 + 0.24 * noise(i + 7));
    // a quadratic with its control point at twice the sag traces a parabola that dips exactly `depth`
    d += ` Q${x + span / 2} ${top + depth * 2} ${x + span} ${top}`;
    const total = Math.round(span / GARLAND.spacing);
    for (let k = 1; k < total; k++) {
      const u = k / total;
      points.push({
        x: x + u * span,
        y: top + 4 * depth * u * (1 - u),
        slope: (Math.atan((4 * depth * (1 - 2 * u)) / span) * 180) / Math.PI,
      });
    }
  }
  strands.push({
    d,
    delay: 0.1,
    lights: points.map((point, n) => ({
      x: point.x,
      y: point.y,
      angle: point.slope + podAngle(900, n) * 0.6,
      scale: 0.9,
      fade: 0.9,
      power: 0.5 + (point.x / width) * 1.1,
      // later lights lag behind, so the bright band rolls along the wire like a ladi chaser
      chase: ((points.length - n) * CHASE_STEP) % CHASE,
      saffron: noise(n * 3 + 1) > 0.82,
    })),
  });

  return strands;
}

function Kandil() {
  const id = useId();
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 60 112" className="-mt-1 w-8 overflow-visible md:w-11">
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#FF6FA0" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FF6FA0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF6FA0" />
          <stop offset="1" stopColor="#C2185B" />
        </linearGradient>
      </defs>

      <circle cx="30" cy="30" r="38" fill={`url(#${id}-glow)`} />

      <motion.g
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ originY: 0 }}
        animate={reduceMotion ? {} : { skewX: [-5, 5, -5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {TAILS.map((d, i) => (
          <path key={d} d={d} stroke={i % 2 === 0 ? "#FFB400" : "#C2185B"} />
        ))}
      </motion.g>

      <path
        d={STAR}
        fill={`url(#${id}-body)`}
        stroke="#C2185B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d={STAR_CORE} fill="#FFF4CF" fillOpacity="0.9" />
      <circle cx="30" cy="4" r="2.2" fill="#C2185B" />
    </svg>
  );
}

export default function DiwaliLights() {
  const show = useDiwali(DIWALI_LIGHTS_ENABLED);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      }),
    );
    observer.observe(el);
    const intersection = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    intersection.observe(el);
    return () => {
      observer.disconnect();
      intersection.disconnect();
    };
  }, [show]);

  const strands = useMemo(
    () => (size.width ? buildStrands(size.width, size.height) : []),
    [size],
  );

  if (!show) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      data-fairy-lights
      data-paused={visible ? undefined : ""}
      className="pointer-events-none absolute inset-0"
    >
      <svg
        width={size.width}
        height={size.height}
        className="absolute left-0 top-0"
      >
        {strands.map((strand, si) => (
          <g
            // keyed by position so a resize updates paths in place instead of replaying the intro
            key={si}
            style={
              strand.sway && {
                transformOrigin: strand.sway.origin,
                animation: `fairy-sway ${strand.sway.duration}s ease-in-out -${strand.sway.phase}s infinite`,
              }
            }
          >
            <path
              d={strand.d}
              fill="none"
              strokeWidth="0.8"
              pathLength={1}
              strokeDasharray="1"
              className="stroke-black/30 dark:stroke-white/70"
              style={{
                animation: `fairy-wire 1.4s cubic-bezier(0.65, 0, 0.35, 1) ${strand.delay}s both`,
              }}
            />
            {/* a dashed highlight over the wire reads as the twist of a two-core cable */}
            <path
              d={strand.d}
              fill="none"
              strokeWidth="0.8"
              strokeDasharray="1.5 3"
              className="stroke-white/40 dark:stroke-black/25"
              style={{
                animation: `fairy-power 0.8s ease-out ${strand.delay + 1.2}s both`,
              }}
            />
            {strand.lights.map((light, i) => (
              <g
                key={i}
                transform={`translate(${light.x} ${light.y}) rotate(${light.angle}) scale(${light.scale})`}
                opacity={light.fade}
              >
                <g
                  style={{
                    animation: `fairy-power 0.5s ease-out ${light.power}s both`,
                  }}
                >
                  <rect
                    x="-0.6"
                    y="0"
                    width="1.2"
                    height="3.6"
                    rx="0.6"
                    className="fill-black/25 dark:fill-white/60"
                  />
                  <g
                    style={{
                      animation: `fairy-chase ${CHASE}s ease-in-out -${light.chase}s infinite`,
                    }}
                  >
                    <rect
                      x="-1.25"
                      y="3"
                      width="2.5"
                      height="4.4"
                      rx="1.25"
                      className={
                        light.saffron
                          ? "fill-[#F28A1E] dark:fill-[#FFCB8E]"
                          : "fill-[#E9A520] dark:fill-[#FFFAEB]"
                      }
                    />
                    <circle cy="6.1" r="0.65" fill="#FFFFFF" />
                  </g>
                </g>
              </g>
            ))}
          </g>
        ))}
      </svg>

      <motion.div
        className="absolute right-[21%] top-0 flex translate-x-1/2 flex-col items-center text-black/25 dark:text-white/25 max-md:hidden"
        style={{ originY: 0 }}
        animate={reduceMotion ? {} : { rotate: [-3, 3, -3] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span
          className="block w-px bg-current"
          initial={{ height: reduceMotion ? 150 : 0 }}
          animate={
            reduceMotion ? { height: 150 } : { height: [0, 160, 142, 153, 150] }
          }
          transition={{
            duration: 2.4,
            delay: 0.4,
            ease: "easeOut",
            times: [0, 0.45, 0.65, 0.85, 1],
          }}
        />
        <Kandil />
      </motion.div>
    </div>
  );
}
