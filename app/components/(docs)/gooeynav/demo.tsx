"use client";

import { GooeyNav } from "@/components/ui/gooey-nav";

const items = ["Home", "Changelog", "Career", "About"];

export default function GooeyNavPage() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <GooeyNav items={items} size="md" />
    </div>
  );
}
