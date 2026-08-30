"use client";

import { GooeyNav } from "@/components/ui/gooey-nav";
import { BookIcon, BriefcaseIcon, HouseIcon, InfoIcon } from "./icons";

const items = [
  { label: "Home", icon: <HouseIcon /> },
  { label: "Changelog", icon: <BookIcon /> },
  { label: "Career", icon: <BriefcaseIcon /> },
  { label: "About", icon: <InfoIcon /> },
];

export default function GooeyNavPage() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <GooeyNav items={items} size="md" />
    </div>
  );
}
