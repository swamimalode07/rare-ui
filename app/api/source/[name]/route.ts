import { readFile } from "node:fs/promises";
import path from "node:path";
import registry from "@/registry.json";

// without this the handler runs on every request and is billed on every invocation
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.items.map((item) => ({ name: item.name }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const file = registry.items
    .find((entry) => entry.name === name)
    ?.files?.[0]?.path;
  if (!file) return new Response("Source not found.", { status: 404 });

  try {
    const code = await readFile(path.join(process.cwd(), file), "utf8");
    return new Response(code, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Unable to read source.", { status: 500 });
  }
}
