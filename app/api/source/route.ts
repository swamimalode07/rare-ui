import { readFile } from "node:fs/promises"
import path from "node:path"
import registry from "@/registry.json"

// Serves the raw source of a registry component, e.g. /api/source?name=folder-component
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")
  if (!name) return new Response("Missing 'name' query.", { status: 400 })

  const item = registry.items.find((entry) => entry.name === name)
  const file = item?.files?.[0]?.path
  if (!file) return new Response("Source not found.", { status: 404 })

  try {
    const code = await readFile(path.join(process.cwd(), file), "utf8")
    return new Response(code, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  } catch {
    return new Response("Unable to read source.", { status: 500 })
  }
}
