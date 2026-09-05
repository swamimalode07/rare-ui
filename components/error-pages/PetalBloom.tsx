import { BackHome } from "./BackHome";
import { FLAME, INK } from "./ErrorShell";
import { RareFlower, FLOWER_ASPECT } from "./RareFlower";

// the figma frame is 1440x1024; the bloom is 1632 wide and starts 355px down
const BLOOM_WIDTH = "max(113.3vw, 110vh)";
const BLOOM_TOP = "24vh";
// measured against the bloom box, so the copy tracks the petal at any aspect
const LINK_ON_BLOOM = "5.84%";

const RISE = "error-rise 0.85s cubic-bezier(0.22,1,0.36,1) both";
const COPY = "error-copy 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s both";

export function PetalBloom({ code = "404" }: { code?: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{
        width: BLOOM_WIDTH,
        height: `calc(${BLOOM_WIDTH} / ${FLOWER_ASPECT})`,
        top: BLOOM_TOP,
      }}
    >
      <div data-error-anim className="h-full w-full origin-top" style={{ animation: RISE }}>
        <RareFlower className="h-full w-full" style={{ color: FLAME }} />
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ top: LINK_ON_BLOOM }}
      >
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
    </div>
  );
}
