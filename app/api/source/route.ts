import { readFile } from "node:fs/promises";
import path from "node:path";
import registry from "@/registry-pro.json";
import { getSession } from "@/lib/auth";
import { activeLicense } from "@/lib/license";

type Item = { name: string; files?: { path: string }[] };

// Serves the raw source of a registry component, e.g. /api/source?name=utils
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name) return new Response("Missing 'name' query.", { status: 400 });

  const item = (registry.items as Item[]).find((entry) => entry.name === name);
  const file = item?.files?.[0]?.path;
  if (!file) return new Response("Source not found.", { status: 404 });

  const session = await getSession();
  if (!session || !(await activeLicense(session.user.id))) {
    return new Response("RareUI Pro license required.", { status: 401 });
  }

  try {
    const code = await readFile(path.join(process.cwd(), file), "utf8");
    return new Response(code, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return new Response("Unable to read source.", { status: 500 });
  }
}
