"use client";

import { useEffect, useRef } from "react";

import { FLAME } from "./ErrorShell";
import { RareFlower, FLOWER_ASPECT } from "./RareFlower";

const SPEED = 104; // px per second
// a bounce landing this close to a wall end counts as a corner approach
const CORNER = 120;
// keep the heading this far off a perfect diagonal so the path can never converge on a corner
const MIN_OFF_DIAGONAL = 0.2;
const JITTER = 0.1;

const TAU = Math.PI * 2;

function normalize(angle: number) {
  return ((angle % TAU) + TAU) % TAU;
}

// nudge a heading away from the 45 degree diagonals, which are the only ones that reach a corner
function offDiagonal(angle: number) {
  const a = normalize(angle);
  for (let k = 0; k < 4; k += 1) {
    const diagonal = Math.PI / 4 + (k * Math.PI) / 2;
    const delta = a - diagonal;
    if (Math.abs(delta) < MIN_OFF_DIAGONAL) {
      return diagonal + (delta < 0 ? -MIN_OFF_DIAGONAL : MIN_OFF_DIAGONAL);
    }
  }
  return a;
}

export function DriftingLogo({ width = 105 }: { width?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const height = width / FLOWER_ASPECT;
    let maxX = Math.max(0, window.innerWidth - width);
    let maxY = Math.max(0, window.innerHeight - height);

    let x = 0;
    let y = 0;
    let angle = offDiagonal(0.9);

    const onResize = () => {
      maxX = Math.max(0, window.innerWidth - width);
      maxY = Math.max(0, window.innerHeight - height);
      x = Math.min(x, maxX);
      y = Math.min(y, maxY);
    };
    window.addEventListener("resize", onResize);

    // steer away from whichever corner the contact point sits nearest
    const reflect = (vertical: boolean, along: number, limit: number) => {
      angle = vertical ? Math.PI - angle : -angle;

      const nearStart = along < CORNER;
      const nearEnd = along > limit - CORNER;
      let bias = (Math.random() - 0.5) * 2 * JITTER;
      if (nearStart) bias = Math.abs(bias) + JITTER;
      if (nearEnd) bias = -Math.abs(bias) - JITTER;

      angle = offDiagonal(angle + bias);
    };

    let last = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      x += Math.cos(angle) * SPEED * dt;
      y += Math.sin(angle) * SPEED * dt;

      if (x <= 0) {
        x = 0;
        reflect(true, y, maxY);
      } else if (x >= maxX) {
        x = maxX;
        reflect(true, y, maxY);
      }

      if (y <= 0) {
        y = 0;
        reflect(false, x, maxX);
      } else if (y >= maxY) {
        y = maxY;
        reflect(false, x, maxX);
      }

      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(step);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [width]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-0 will-change-transform"
      style={{ width, height: width / FLOWER_ASPECT }}
    >
      <RareFlower className="h-full w-full" style={{ color: FLAME }} />
    </div>
  );
}
