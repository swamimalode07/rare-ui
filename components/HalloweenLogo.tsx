"use client";

import { useId, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HALLOWEEN_LOGO_ENABLED } from "@/lib/site";

const PETALS = [
  "M155.726 142.646C146.149 139.871 142.461 128.258 148.681 120.466L187.804 71.4521C197.894 58.8118 216.188 56.4448 229.162 66.1009L255.614 85.7874C261.744 90.3494 264.325 98.2844 262.053 105.58L251.408 139.759C246.55 155.357 230.105 164.2 214.415 159.653L155.726 142.646Z",
  "M143.404 115.886C137.806 124.137 125.622 124.056 120.132 115.732L85.6075 63.3779C76.7038 49.876 80.1057 31.7465 93.2985 22.3909L120.196 3.31712C126.428 -1.1029 134.773 -1.10601 141.009 3.30938L170.226 23.9958C183.559 33.4357 186.888 51.808 177.715 65.3256L143.404 115.886Z",
  "M115.051 118.12C121.167 125.995 117.326 137.557 107.713 140.206L47.2524 156.862C31.6599 161.158 15.4689 152.32 10.648 136.882L0.819439 105.408C-1.45817 98.1138 1.11742 90.1769 7.2438 85.6103L35.9463 64.2156C49.0442 54.4526 67.546 56.964 77.5674 69.8653L115.051 118.12Z",
  "M109.654 146.532C119.096 143.328 128.766 150.741 128.123 160.691L124.084 223.274C123.043 239.413 109.394 251.822 93.2286 251.327L60.2704 250.318C52.6329 250.085 45.9754 245.054 43.6643 237.771L32.8367 203.649C27.8957 188.078 36.3217 171.416 51.7915 166.166L109.654 146.532Z",
  "M133.079 159.806C132.95 149.836 142.988 142.93 152.253 146.616L210.525 169.796C225.553 175.774 233.137 192.589 227.67 207.811L216.526 238.844C213.944 246.035 207.102 250.813 199.461 250.76L163.663 250.513C147.327 250.401 134.085 237.238 133.872 220.903L133.079 159.806Z",
];

const FACE = [
  "M27.2 95.6L104.6 123.8C92.3 148.4 50 148.4 32.4 127.3C25.4 118.5 23.6 106.2 27.2 95.6Z",
  "M235.8 95.6L158.4 123.8C170.7 148.4 213 148.4 230.6 127.3C237.6 118.5 239.4 106.2 235.8 95.6Z",
  "M40 178C68 198 100 206 132 206L132 234C86 236 54 216 40 178Z",
  "M223 178C195 198 163 206 131 206L131 234C177 236 209 216 223 178Z",
];

const TEETH = [
  "M72 188L90 196L90 216L72 212Z",
  "M191 188L173 196L173 216L191 212Z",
  "M142 220L158 220L158 240L142 240Z",
];

const SWARM = [
  { x: [0, -14, -30, -52], y: [0, -14, -10, -30], rotate: [0, -20, 10, -15], scale: 1, delay: 0 },
  { x: [0, 12, 30, 58], y: [0, -16, -26, -22], rotate: [0, 18, -8, 12], scale: 0.9, delay: 0.06 },
  { x: [0, -6, 8, -4], y: [0, -18, -34, -54], rotate: [0, -10, 14, -6], scale: 0.75, delay: 0.12 },
  { x: [0, 18, 26, 44], y: [0, -6, -32, -50], rotate: [0, 24, -6, 18], scale: 0.65, delay: 0.18 },
  { x: [0, -18, -24, -40], y: [0, -4, -26, -46], rotate: [0, -24, 4, -18], scale: 0.55, delay: 0.24 },
];

const FACE_FLICKER = [1, 0.9, 1, 0.95, 0.86, 1, 0.97, 1];

const subscribe = () => () => {};

function isSpookySeason() {
  if (!HALLOWEEN_LOGO_ENABLED) return false;
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  return (month === 9 && day >= 20) || (month === 10 && day <= 2);
}

const BatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 170 77" fill="currentColor" className={className}>
    <path d="M5.8 19.2C20 17 33 11 40.8 3.2C45 13 56 26 73 34.7L77.3 20.3L82 25.2C84.5 24.3 87 24.3 89.5 26L94.7 21L97.2 33.2C110 29 125 15 130.5 1.5C142 9 156 12 166.2 11.3C150 17 143 25 141.8 33C130 30 118 40 115.5 53C98 55 87 62 82.8 75C78 64 65 48 50.2 53.7C50 43 40 33 24.7 36.2C24 25 13 20 5.8 19.2Z" />
  </svg>
);

export default function HalloweenLogo({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion();
  const spooky = useSyncExternalStore(subscribe, isSpookySeason, () => false);
  const id = useId();

  if (!spooky) {
    return <img src="/logos/Rareui.svg" alt="" className="h-5 w-5" />;
  }

  const lit = reduceMotion || hovered;
  const flickerTransition = lit
    ? { duration: 0.2 }
    : { duration: 2.6, repeat: Infinity, ease: "linear" as const };

  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <motion.svg
        viewBox="0 0 263 252"
        aria-hidden
        className="h-6 w-6 shrink-0 overflow-visible"
        initial={false}
        animate={{
          rotate: hovered && !reduceMotion ? [0, -10, 8, -4, 0] : 0,
          scale: hovered && !reduceMotion ? 1.1 : 1,
        }}
        transition={{
          rotate: { duration: 0.5, ease: "easeInOut" },
          scale: { type: "spring", stiffness: 400, damping: 16 },
        }}
      >
        <defs>
          <radialGradient
            id={`${id}-flesh`}
            gradientUnits="userSpaceOnUse"
            cx="131"
            cy="130"
            r="150"
          >
            <stop offset="0" stopColor="#FF9A3C" />
            <stop offset="0.55" stopColor="#FF6A14" />
            <stop offset="1" stopColor="#E04800" />
          </radialGradient>
          <radialGradient
            id={`${id}-light`}
            gradientUnits="userSpaceOnUse"
            cx="131"
            cy="150"
            r="130"
          >
            <stop offset="0" stopColor="#FFF8D6" />
            <stop offset="1" stopColor="#FFD25E" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            {PETALS.map((d) => (
              <path key={d} d={d} />
            ))}
          </clipPath>
        </defs>

        <path
          d="M124 8C121 -18 127 -40 147 -54L158 -45C141 -33 137 -14 140 8Z"
          fill="#6F8C2E"
        />
        <path
          d="M152 -48C170 -58 190 -50 186 -36C183 -26 170 -28 172 -36"
          fill="none"
          stroke="#6F8C2E"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <g fill={`url(#${id}-flesh)`}>
          {PETALS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        <g clipPath={`url(#${id}-clip)`}>
          <motion.g
            fill={`url(#${id}-light)`}
            initial={false}
            animate={{ opacity: lit ? 1 : FACE_FLICKER }}
            transition={flickerTransition}
          >
            {FACE.map((d) => (
              <path key={d} d={d} />
            ))}
          </motion.g>
          <g fill={`url(#${id}-flesh)`}>
            {TEETH.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>
      </motion.svg>

      <AnimatePresence>
        {hovered && !reduceMotion && (
          <span key="swarm" className="pointer-events-none absolute inset-0">
            {SWARM.map((bat, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute left-1/2 top-1/2 -ml-2 -mt-1 text-white"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  x: bat.x,
                  y: bat.y,
                  rotate: bat.rotate,
                  scale: [0, bat.scale, bat.scale, bat.scale * 0.7],
                  opacity: [0, 1, 1, 0],
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{
                  duration: 1.3,
                  delay: bat.delay,
                  ease: "easeOut",
                  times: [0, 0.25, 0.6, 1],
                }}
              >
                <motion.span
                  className="block"
                  animate={{ scaleY: [1, 0.3, 1] }}
                  transition={{ duration: 0.12, repeat: Infinity }}
                >
                  <BatIcon className="h-2 w-4" />
                </motion.span>
              </motion.span>
            ))}
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
