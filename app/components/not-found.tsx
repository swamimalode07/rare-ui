"use client"

import { usePathname } from "next/navigation"
import { components } from "@/lib/components"

export default function ComponentNotFound() {
  const pathname = usePathname()
  const item = components.find((c) => c.href === pathname)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">{item?.name ?? "Component"}</h1>
      <p className="text-foreground/55">This component is not available yet.</p>
    </div>
  )
}
