import { BackHome } from "./BackHome";
import { INK } from "./ErrorShell";
import { RareFlower, FLOWER_ASPECT } from "./RareFlower";

import { cn } from "@/lib/utils";

// four nested copies of the bloom, shifted up to match 401's centered position
const LAYERS = [
  { width: 108.57, top: 23.97, tint: "text-[#FC4C01]" },
  { width: 94.98, top: 42.22, tint: "text-[#FF6622] dark:text-[#FF7D33]" },
  { width: 78.54, top: 52.43, tint: "text-[#FF8547] dark:text-[#FFB489]" },
  { width: 60.28, top: 64.81, tint: "text-[#FFA366] dark:text-[#FFE7D8]" },
];

// figma expands each layer box by 95px of blur bleed, roughly a 32px css blur at frame scale
const BLUR = "2.2vw";

const FADE = "error-fade 0.9s cubic-bezier(0.22,1,0.36,1) both";
const COPY = "error-copy 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both";
const BREATHE = "error-breathe 7.5s cubic-bezier(0.45,0,0.55,1) infinite";

export function GlowBloom({ code = "404" }: { code?: string }) {
  return (
    <>
      <div
        aria-hidden
        data-error-anim
        className="absolute inset-0 [isolation:isolate]"
        style={{ animation: FADE }}
      >
        {LAYERS.map((layer, i) => {
          const size = `max(${layer.width}vw, ${(layer.width * 0.97).toFixed(2)}vh)`;
          return (
            <div
              key={layer.width}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: size,
                height: `calc(${size} / ${FLOWER_ASPECT})`,
                top: `${layer.top}vh`,
                filter: `blur(${BLUR})`,
              }}
            >
              <div
                data-error-anim
                className="h-full w-full"
                style={{ animation: BREATHE, animationDelay: `${i * 0.5}s` }}
              >
                <RareFlower className={cn("h-full w-full", layer.tint)} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: "32.85vh" }}>
        <div data-error-anim style={{ animation: COPY }}>
          <BackHome className="text-white text-[clamp(11px,1.2vw,17px)] tracking-[-0.03em]" />
          <p
            className="mt-[0.8vh] whitespace-nowrap font-runde font-medium leading-none tracking-[-0.05em]"
            style={{ color: INK, fontSize: "clamp(40px,5vw,70px)" }}
          >
            {code}
          </p>
        </div>
      </div>
    </>
  );
}
