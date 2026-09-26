import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { installerId, trackInstall } from "@/lib/installs";

export const config = {
  matcher: "/r/:path*",
};

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const component = requestedComponent(request.nextUrl.pathname);
  const agent = request.headers.get("user-agent") ?? "";

  // the cli names itself; browsers and crawlers hit the same urls and are not installs
  if (component && agent.toLowerCase().includes("shadcn")) {
    event.waitUntil(report(component, request));
  }

  return NextResponse.next();
}

async function report(component: string, request: NextRequest) {
  await trackInstall({
    component,
    installerId: await installerId(request.headers.get("x-forwarded-for")),
  });
}

// next treats the .json as an optional suffix, so the path can arrive either way
function requestedComponent(pathname: string) {
  const name = pathname.slice("/r/".length).replace(/\.json$/, "");
  if (!name || name.includes("/") || name === "registry") return null;
  return name;
}
