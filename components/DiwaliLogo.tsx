"use client";

import { useEffect, useId } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

const PETALS = [
  {
    d: "M155.726 142.646C146.149 139.871 142.461 128.258 148.681 120.466L187.804 71.4521C197.894 58.8118 216.188 56.4448 229.162 66.1009L255.614 85.7874C261.744 90.3494 264.325 98.2844 262.053 105.58L251.408 139.759C246.55 155.357 230.105 164.2 214.415 159.653L155.726 142.646Z",
    color: "#FF6B1A",
    dot: [212, 108],
  },
  {
    d: "M143.404 115.886C137.806 124.137 125.622 124.056 120.132 115.732L85.6075 63.3779C76.7038 49.876 80.1057 31.7465 93.2985 22.3909L120.196 3.31712C126.428 -1.1029 134.773 -1.10601 141.009 3.30938L170.226 23.9958C183.559 33.4357 186.888 51.808 177.715 65.3256L143.404 115.886Z",
    color: "#FFB400",
    dot: [131, 48],
  },
  {
    d: "M115.051 118.12C121.167 125.995 117.326 137.557 107.713 140.206L47.2524 156.862C31.6599 161.158 15.4689 152.32 10.648 136.882L0.819439 105.408C-1.45817 98.1138 1.11742 90.1769 7.2438 85.6103L35.9463 64.2156C49.0442 54.4526 67.546 56.964 77.5674 69.8653L115.051 118.12Z",
    color: "#E8175D",
    dot: [52, 108],
  },
  {
    d: "M109.654 146.532C119.096 143.328 128.766 150.741 128.123 160.691L124.084 223.274C123.043 239.413 109.394 251.822 93.2286 251.327L60.2704 250.318C52.6329 250.085 45.9754 245.054 43.6643 237.771L32.8367 203.649C27.8957 188.078 36.3217 171.416 51.7915 166.166L109.654 146.532Z",
    color: "#B14EFF",
    dot: [82, 208],
  },
  {
    d: "M133.079 159.806C132.95 149.836 142.988 142.93 152.253 146.616L210.525 169.796C225.553 175.774 233.137 192.589 227.67 207.811L216.526 238.844C213.944 246.035 207.102 250.813 199.461 250.76L163.663 250.513C147.327 250.401 134.085 237.238 133.872 220.903L133.079 159.806Z",
    color: "#19C3A8",
    dot: [180, 208],
  },
];

const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  angle: i * 30,
  length: 12 + (i % 3) * 5,
  delay: (i % 4) * 0.08,
  duration: 0.42 + (i % 3) * 0.08,
}));

const GLOW_PULSE = [0.75, 1, 0.82, 0.95, 0.7, 1, 0.75];

// one revolution every 0.55s, so the settle spring starts at the same speed
const SPIN_DURATION = 0.55;

export default function DiwaliLogo({ hovered }: { hovered: boolean }) {
  const reduceMotion = useReducedMotion();
  const rotate = useMotionValue(0);
  const id = useId();
  const spinning = hovered && !reduceMotion;

  useEffect(() => {
    if (spinning) {
      const from = rotate.get() % 360;
      const controls = animate(rotate, [from, from + 360], {
        duration: SPIN_DURATION,
        ease: "linear",
        repeat: Infinity,
      });
      return () => controls.stop();
    }

    const current = rotate.get() % 360;
    if (current === 0) return;
    rotate.set(current);
    // the logo has five-fold symmetry, so any multiple of 72 lands back on the original shape
    const controls = animate(rotate, Math.ceil((current + 120) / 72) * 72, {
      type: "spring",
      velocity: 360 / SPIN_DURATION,
      stiffness: 70,
      damping: 15,
    });
    return () => controls.stop();
  }, [spinning, rotate]);

  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <motion.svg
        viewBox="0 0 263 252"
        aria-hidden
        className="h-[22px] w-[22px] shrink-0 overflow-visible"
        style={{ rotate }}
        initial={false}
        animate={{ scale: spinning ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 16 }}
      >
        <defs>
          <radialGradient
            id={`${id}-shine`}
            gradientUnits="userSpaceOnUse"
            cx="131"
            cy="132"
            r="140"
          >
            <stop offset="0" stopColor="#FFF4CF" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#FFF4CF" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id={`${id}-core`}
            gradientUnits="userSpaceOnUse"
            cx="131"
            cy="134"
            r="34"
          >
            <stop offset="0" stopColor="#FFFBEA" />
            <stop offset="0.45" stopColor="#FFD36B" />
            <stop offset="1" stopColor="#FFB400" stopOpacity="0" />
          </radialGradient>
        </defs>

        {PETALS.map((petal) => (
          <path key={petal.d} d={petal.d} fill={petal.color} />
        ))}
        <g fill={`url(#${id}-shine)`}>
          {PETALS.map((petal) => (
            <path key={petal.d} d={petal.d} />
          ))}
        </g>
        <g fill="#FFFFFF" fillOpacity="0.85">
          {PETALS.map((petal) => (
            <circle
              key={petal.d}
              cx={petal.dot[0]}
              cy={petal.dot[1]}
              r="13"
            />
          ))}
        </g>

        <motion.circle
          cx="131"
          cy="134"
          r="34"
          fill={`url(#${id}-core)`}
          initial={false}
          animate={{ opacity: reduceMotion || spinning ? 1 : GLOW_PULSE }}
          transition={
            reduceMotion || spinning
              ? { duration: 0.2 }
              : { duration: 2.4, repeat: Infinity, ease: "linear" }
          }
        />
      </motion.svg>

      <AnimatePresence>
        {spinning && (
          <motion.span
            key="sparks"
            className="pointer-events-none absolute inset-0"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {SPARKS.map((spark) => (
              <span
                key={spark.angle}
                aria-hidden
                className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{
                  transform: `rotate(${spark.angle}deg) translateX(9px) rotate(55deg)`,
                }}
              >
                <motion.span
                  className="absolute -top-px left-0 block h-[2px] w-2 origin-left rounded-full bg-[linear-gradient(to_right,transparent,#FFC94D,#FFFBEA)]"
                  initial={{ x: 0, opacity: 0, scaleX: 0.3 }}
                  animate={{
                    x: [0, spark.length],
                    opacity: [0, 1, 0],
                    scaleX: [0.3, 1, 0.5],
                  }}
                  transition={{
                    duration: spark.duration,
                    delay: spark.delay,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
