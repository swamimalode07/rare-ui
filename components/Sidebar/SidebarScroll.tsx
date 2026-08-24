"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SCROLL_FADE = 24;
export const SCROLL_SELECTOR = "[data-sidebar-scroll]";

const SidebarScroll = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const update = () => {
      setFadeTop(scroller.scrollTop > 2);
      setFadeBottom(
        scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2,
      );
    };

    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(content);

    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const mask = `linear-gradient(to bottom, transparent 0, #000 ${
    fadeTop ? SCROLL_FADE : 0
  }px, #000 calc(100% - ${fadeBottom ? SCROLL_FADE : 0}px), transparent 100%)`;

  return (
    <div
      ref={scrollRef}
      data-sidebar-scroll=""
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className={cn("no-scrollbar overflow-y-auto", className)}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

export default SidebarScroll;
