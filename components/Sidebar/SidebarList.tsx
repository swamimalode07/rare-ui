"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAnimate } from "motion/react";
import { cn } from "@/lib/utils";
import { components } from "@/lib/components";

const SidebarList = () => {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    components.findIndex((c) => pathname === c.href),
  );

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el || !dot.current) return;

    const toY = el.offsetTop + el.offsetHeight / 2 - 3;

    if (prevY.current === null) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      return;
    }

    const fromY = prevY.current;
    const delta = toY - fromY;
    prevY.current = toY;
    if (delta === 0) return;

    const radius = Math.min(Math.abs(delta) / 2, 8);
    const steps = 20;
    const x: number[] = [];
    const y: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      y.push(fromY + (delta * (1 - Math.cos(Math.PI * t))) / 2);
      x.push(-radius * Math.sin(Math.PI * t));
    }

    animate(dot.current, { x, y }, { duration: 0.25, ease: "easeOut" });
  }, [activeIndex, animate, dot]);

  return (
    <ul className="relative flex flex-col gap-1 pl-6">
      <span
        ref={dot}
        aria-hidden
        className="absolute left-2 top-0 h-1.5 w-1.5 rounded-full bg-[#FC4C01]"
      />

      {components.map((component, i) => {
        const isActive = i === activeIndex;

        return (
          <li
            key={component.href}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <Link
              href={component.href}
              className={cn(
                "flex w-full items-center rounded-lg p-1 text-left text-sm transition-colors duration-200",
                isActive
                  ? "text-foreground"
                  : "text-foreground/55 hover:text-foreground",
              )}
            >
              {component.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarList;
