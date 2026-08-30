"use client";

import { GooeyNav } from "@/components/ui/gooey-nav";
import { useIsMobile } from "@/lib/use-media-query";
import { BookIcon, BriefcaseIcon, HouseIcon, InfoIcon } from "./icons";

const items = [
  { label: "Home", icon: <HouseIcon /> },
  { label: "Changelog", icon: <BookIcon /> },
  { label: "Career", icon: <BriefcaseIcon /> },
  { label: "About", icon: <InfoIcon /> },
];

export default function GooeyNavPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative flex h-full items-center justify-center px-2">
      <GooeyNav
        items={isMobile ? items.slice(0, 3) : items}
        size={isMobile ? "xs" : "md"}
      />
    </div>
  );
}
