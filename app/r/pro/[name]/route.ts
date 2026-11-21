import { readFile } from "node:fs/promises";
import path from "node:path";
import { after } from "next/server";
import { installerId, trackInstall } from "@/lib/installs";
import { licenseFromRequest } from "@/lib/license";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const name = (await params).name.replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(name)) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (!(await licenseFromRequest(request))) {
    return Response.json(
      { error: "A valid RareUI Pro token is required. Get one at /account." },
      { status: 401 },
    );
  }

  try {
    const item = await readFile(
      path.join(process.cwd(), "registry/pro", `${name}.json`),
      "utf8",
    );
    after(async () =>
      trackInstall({
        component: `pro/${name}`,
        installerId: await installerId(request.headers.get("x-forwarded-for")),
      }),
    );
    return new Response(item, {
      headers: {
        "content-type": "application/json",
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
}
