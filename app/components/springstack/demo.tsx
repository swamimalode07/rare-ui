"use client";

import { SpringStack } from "@/components/ui/spring-stack";

export default function SpringStackPage() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <SpringStack cardCount={5} />
    </div>
  );
}
