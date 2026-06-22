import { redirect } from "next/navigation"
import { components } from "@/lib/components"

export default function ComponentsIndexPage() {
  redirect(components[0].href)
}
