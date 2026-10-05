import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { installerId, trackInstall } from "@/lib/installs";

// loosening this matcher puts every crawler and bot hit back on the meter
export const config = {
  matcher: [
    {
      source: "/r/:path*",
      has: [{ type: "header", key: "user-agent", value: ".*shadcn.*" }],
    },
  ],
};

// per instance, so a cold start clears it
const BUDGET_WINDOW_MS = 60 * 1000;
const BUDGET_MAX = 60;
const MAX_TRACKED_IPS = 5000;
const budget = new Map<string, number[]>();

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const component = requestedComponent(request.nextUrl.pathname);
  const agent = request.headers.get("user-agent") ?? "";

  // the cli names itself; browsers and crawlers hit the same urls and are not installs
  if (!component || !agent.toLowerCase().includes("shadcn")) {
    return NextResponse.next();
  }

  if (!withinBudget(clientIp(request))) {
    return new Response(null, { status: 429 });
  }

  event.waitUntil(report(component, request));

  return NextResponse.next();
}

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

function withinBudget(ip: string) {
  const now = Date.now();
  for (const [key, hits] of budget) {
    const live = hits.filter((at) => now - at < BUDGET_WINDOW_MS);
    if (live.length === 0 || budget.size > MAX_TRACKED_IPS) budget.delete(key);
    else budget.set(key, live);
  }

  const hits = budget.get(ip) ?? [];
  hits.push(now);
  budget.set(ip, hits);

  return hits.length <= BUDGET_MAX;
}

async function report(component: string, request: NextRequest) {
  await trackInstall({
    component,
    installerId: await installerId(clientIp(request)),
  });
}

// next treats the .json as an optional suffix, so the path can arrive either way
function requestedComponent(pathname: string) {
  const name = pathname.slice("/r/".length).replace(/\.json$/, "");
  if (!name || name.includes("/") || name === "registry") return null;
  return name;
}
