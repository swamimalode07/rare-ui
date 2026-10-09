"use client";

import { useEffect, useRef, useState } from "react";

import RailToc, { type RailTocItem } from "@/components/ui/rail-toc";

const items: RailTocItem[] = [
  { id: "installation", label: "Installation", depth: 0 },
  { id: "prerequisites", label: "Prerequisites", depth: 1 },
  { id: "installation-steps", label: "Installation Steps", depth: 1 },
  { id: "configuration", label: "Configuration", depth: 1 },
  { id: "usage", label: "Usage", depth: 0 },
  { id: "customizing-content", label: "Customizing Content", depth: 1 },
  { id: "submenu-content", label: "Submenu Content", depth: 2 },
  { id: "features", label: "Features", depth: 0 },
];

const FRAME_HEIGHT = 400;

export default function Demo() {
  const scrollRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);

  // the toc grows with the frame so a recording keeps the same proportions at any size
  useEffect(() => {
    const frame = scrollRef.current;
    if (!frame) return;
    const ro = new ResizeObserver(() =>
      setScale(Math.max(1, frame.clientHeight / FRAME_HEIGHT)),
    );
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex h-full items-center justify-center px-6 py-16 [container-type:size]">
      <main
        ref={scrollRef}
        className="h-[min(100cqh,calc(100cqw*9/16))] w-[min(100cqw,calc(100cqh*16/9))] overflow-auto border border-foreground/20 [container-type:size] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden dark:border-foreground/10"
      >
        <div className="grid">
          <div className="sticky top-0 z-10 flex h-[100cqh] items-center justify-center self-start [grid-area:1/1]">
            <div style={{ scale }}>
              <RailToc items={items} containerRef={scrollRef} />
            </div>
          </div>

          {/* empty sections the toc tracks, so the preview has something to scroll */}
          <div className="[grid-area:1/1]" aria-hidden>
            {items.map((item) => (
              <div key={item.id} id={item.id} className="h-[50cqh]" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
