const TRACK_URL = "https://basket.databuddy.cc/track";

const QUERY_URL = "https://api.databuddy.cc/v1/query";

const SUMMARY = "custom_events_summary";

export const INSTALL_EVENT = "registry_install";

type Install = {
  component: string;
  installerId: string;
};

export type Installs = {
  total: number | null;
  installers: number | null;
};

const EMPTY: Installs = { total: null, installers: null };

// one id per machine per day, so a dev re-running add does not read as many people
export async function installerId(forwardedFor: string | null) {
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${ip}:${day}`),
  );
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function trackInstall({ component, installerId }: Install) {
  const apiKey = process.env.DATABUDDY_TRACK_API_KEY;
  const websiteId = process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID;
  if (!apiKey || !websiteId) return;

  try {
    const res = await fetch(TRACK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: INSTALL_EVENT,
        websiteId,
        source: "cli",
        anonymousId: installerId,
        timestamp: Date.now(),
        properties: { component },
      }),
    });
    // a wrong key scope fails quietly forever, so say so in the logs
    if (!res.ok) {
      console.error("install not tracked", res.status, await res.text());
    }
  } catch (error) {
    console.error("install not tracked", error);
  }
}

type QueryResult = {
  queryId?: string;
  data?: {
    parameter: string;
    data?: { total_events?: number; unique_users?: number }[];
  }[];
};

export async function fetchInstalls(): Promise<Installs> {
  const apiKey = process.env.DATABUDDY_API_KEY;
  const websiteId = process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID;
  if (!apiKey || !websiteId) return EMPTY;

  try {
    const res = await fetch(`${QUERY_URL}?website_id=${websiteId}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify([
        { id: "installs", parameters: [SUMMARY], preset: "last_30d" },
      ]),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return EMPTY;

    const body = await res.json();
    if (!body?.success) return EMPTY;

    const results = (body.results ?? []) as QueryResult[];
    const row = results
      .find((result) => result.queryId === "installs")
      ?.data?.find((entry) => entry.parameter === SUMMARY)?.data?.[0];

    return {
      total: typeof row?.total_events === "number" ? row.total_events : null,
      installers:
        typeof row?.unique_users === "number" ? row.unique_users : null,
    };
  } catch {
    return EMPTY;
  }
}
