"use client";

import { useEffect, useRef } from "react";

import { BackHome } from "./BackHome";
import { FLAME, INK } from "./ErrorShell";
import { RareFlower, FLOWER_ASPECT } from "./RareFlower";

// the figma frame is 1440x1024: the glyphs a cord carries centre 488px down
const DROP = "47.66vh";
// the cord itself stops just inside the glyph rather than at its centre
const CORD_END = 943;

// each cord is drawn in its own svg, 1 user unit across = 1px, so js can write px straight in
const LANE = 280;
const MID = LANE / 2;

const GLYPH = "clamp(56px,6.94vw,100px)";

// one entry per cord, detuned so the three never swing in lockstep.
// spacing is a multiple of the glyph size rather than of the viewport, so the
// three never collide once the type stops scaling on small screens
const CORDS = [
  { lane: -0.7225, kind: "four", stiffness: 320, damping: 8, color: "#FD4C00" },
  { lane: 0, kind: "flower", stiffness: 260, damping: 7, color: "#8F8F8F" },
  { lane: 0.7225, kind: "four", stiffness: 300, damping: 8.5, color: "#FD4C00" },
] as const;

const laneAt = (lane: number) => `calc(50% + ${lane} * ${GLYPH})`;

const REST_PATH = `M ${MID} 0 Q ${MID} ${CORD_END / 2} ${MID} ${CORD_END}`;

const GRAB = 46; // px, how close the pointer must come to catch a cord
const PLUCK = 0.09; // rad/s gained per px the pointer travels across a cord
const SHOVE = 30; // rad/s^2 that pushes a caught cord out of the way
const MAX_SPEED = 15; // rad/s ceiling
const WHIP = 5.5; // px of trailing curve per rad/s

export function HangingStrings({ code = "404" }: { code?: string }) {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const weights = useRef<(HTMLDivElement | null)[]>([]);
  const lanes = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cords = CORDS.map(() => ({ angle: 0, speed: 0 }));
    let length = 0;
    let pivots: number[] = [];

    // read the laid out lanes rather than recomputing them, since spacing is a css clamp
    const onResize = () => {
      length = window.innerHeight * 0.4766;
      pivots = lanes.current.map((node) =>
        node ? node.getBoundingClientRect().left + MID : 0,
      );
    };
    onResize();
    window.addEventListener("resize", onResize);

    let pointerX = Number.NaN;
    let pointerY = Number.NaN;
    let travel = 0;

    const onMove = (event: PointerEvent) => {
      if (!Number.isNaN(pointerX)) travel = event.clientX - pointerX;
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const onLeave = () => {
      pointerX = Number.NaN;
      pointerY = Number.NaN;
      travel = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let last = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const inReach = !Number.isNaN(pointerX) && pointerY > 0 && pointerY < length;

      cords.forEach((cord, i) => {
        const { stiffness, damping } = CORDS[i];

        if (inReach) {
          const cordX = pivots[i] + Math.sin(cord.angle) * pointerY;
          const gap = pointerX - cordX;
          if (Math.abs(gap) < GRAB) {
            // torque arm grows the further down the cord the pointer is
            const arm = pointerY / length;
            cord.speed += travel * PLUCK * arm;
            cord.speed += Math.sign(gap) * (1 - Math.abs(gap) / GRAB) * SHOVE * arm * dt;
          }
        }

        const accel = -stiffness * cord.angle - damping * cord.speed;
        cord.speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, cord.speed + accel * dt));
        cord.angle += cord.speed * dt;

        const swing = Math.sin(cord.angle) * length;
        const fall = Math.cos(cord.angle) * length;
        // the control point trails the swing, so a fast cord bows instead of staying rigid
        const bow = -cord.speed * WHIP;

        paths.current[i]?.setAttribute(
          "d",
          `M ${MID} 0 Q ${MID + swing * 0.47 + bow} ${Math.cos(cord.angle) * (CORD_END / 2)} ${
            MID + swing * 0.943
          } ${Math.cos(cord.angle) * CORD_END}`,
        );

        const weight = weights.current[i];
        if (weight) {
          weight.style.transform = `translate3d(${swing}px, ${fall - length}px, 0) rotate(${cord.angle}rad)`;
        }
      });

      travel *= 0.6;
      frame = requestAnimationFrame(step);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      {CORDS.map((cord, i) => (
        <svg
          key={`cord-${cord.lane}`}
          ref={(node) => {
            lanes.current[i] = node;
          }}
          aria-hidden
          className="absolute top-0 overflow-visible"
          style={{ left: `calc(${laneAt(cord.lane)} - ${MID}px)`, width: LANE, height: DROP }}
          viewBox={`0 0 ${LANE} 1000`}
          preserveAspectRatio="none"
        >
          <path
            ref={(node) => {
              paths.current[i] = node;
            }}
            d={REST_PATH}
            fill="none"
            stroke={cord.color}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}

      {CORDS.map((cord, i) => (
        <div
          key={`weight-${cord.lane}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: laneAt(cord.lane), top: DROP }}
        >
          <div
            ref={(node) => {
              weights.current[i] = node;
            }}
            className="will-change-transform"
          >
            {cord.kind === "flower" ? (
              <RareFlower
                style={{
                  color: FLAME,
                  width: "clamp(42px,5.25vw,75.6px)",
                  height: `calc(clamp(42px,5.25vw,75.6px) / ${FLOWER_ASPECT})`,
                }}
              />
            ) : (
              <span
                className="block whitespace-nowrap font-runde leading-none"
                style={{ color: INK, fontSize: "clamp(56px,6.94vw,100px)" }}
              >
                {code.length === 3 ? (i === 0 ? code[0] : code[2]) : "4"}
              </span>
            )}
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "54.88vh" }}>
        <BackHome className="text-[#808080]" />
      </div>
    </>
  );
}
