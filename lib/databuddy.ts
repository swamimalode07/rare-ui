import { INSTALL_EVENT } from "@/lib/installs";
import { LAUNCH_DATE } from "@/lib/site";

const QUERY_URL = "https://api.databuddy.cc/v1/query";

const SUMMARY = "summary_metrics";
const TOP_PAGES = "top_pages";
const EVENTS = "custom_events";
const EVENT_PROPERTIES = "custom_event_properties";

const LAST_30D = "last_30d";

const EVENT_FILTER = { field: "event_name", op: "eq", value: INSTALL_EVENT };

const PROPERTY_FILTERS = [
  EVENT_FILTER,
  { field: "property_key", op: "eq", value: "component" },
];

export type Pageviews = {
  lastMonth: number | null;
  sinceLaunch: number | null;
};

export type InstallCount = {
  registry: string;
  lastMonth: number;
  sinceLaunch: number;
};

export type PageCount = {
  path: string;
  pageviews: number;
  visitors: number;
};

export type SiteStats = {
  pageviews: Pageviews;
  visitors: number | null;
  sessions: number | null;
  installs: number | null;
  installers: number | null;
  byComponent: InstallCount[];
  topPages: PageCount[];
};

type Row = Record<string, unknown>;

type QueryResult = {
  queryId?: string;
  data?: { parameter: string; data?: Row[] }[];
};

const EMPTY_PAGEVIEWS: Pageviews = { lastMonth: null, sinceLaunch: null };

const EMPTY_STATS: SiteStats = {
  pageviews: EMPTY_PAGEVIEWS,
  visitors: null,
  sessions: null,
  installs: null,
  installers: null,
  byComponent: [],
  topPages: [],
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

// clickhouse serializes 64 bit counts as strings, so a plain typeof check drops them
function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

async function runQuery(batch: unknown[]): Promise<QueryResult[] | null> {
  const apiKey = process.env.DATABUDDY_API_KEY;
  const websiteId = process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID;
  if (!apiKey || !websiteId) return null;

  try {
    const res = await fetch(`${QUERY_URL}?website_id=${websiteId}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(batch),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const body = await res.json();
    if (!body?.success) return null;

    return (body.results ?? []) as QueryResult[];
  } catch {
    return null;
  }
}

// a batch response is unordered, each entry echoes back the id it was sent with
function rows(results: QueryResult[], id: string, parameter: string): Row[] {
  return (
    results
      .find((result) => result.queryId === id)
      ?.data?.find((entry) => entry.parameter === parameter)?.data ?? []
  );
}

function summaryField(results: QueryResult[], id: string, field: string) {
  return num(rows(results, id, SUMMARY)[0]?.[field]);
}

function pageviewsBatch(end: string) {
  return [
    { id: "lastMonth", parameters: [SUMMARY], preset: LAST_30D },
    {
      id: "sinceLaunch",
      parameters: [SUMMARY],
      startDate: LAUNCH_DATE,
      endDate: end,
    },
  ];
}

export async function fetchPageviews(): Promise<Pageviews> {
  const results = await runQuery(pageviewsBatch(today()));
  if (!results) return EMPTY_PAGEVIEWS;

  return {
    lastMonth: summaryField(results, "lastMonth", "pageviews"),
    sinceLaunch: summaryField(results, "sinceLaunch", "pageviews"),
  };
}

function statsBatch(end: string) {
  const range = { startDate: LAUNCH_DATE, endDate: end };

  return [
    { id: "lastMonth", parameters: [SUMMARY], preset: LAST_30D },
    { id: "sinceLaunch", parameters: [SUMMARY], ...range },
    { id: "pages", parameters: [TOP_PAGES], limit: 200, ...range },
    {
      id: "installTotals",
      parameters: [EVENTS],
      filters: [EVENT_FILTER],
      ...range,
    },
    {
      id: "installsLastMonth",
      parameters: [EVENT_PROPERTIES],
      preset: LAST_30D,
      limit: 500,
      filters: PROPERTY_FILTERS,
    },
    {
      id: "installsSinceLaunch",
      parameters: [EVENT_PROPERTIES],
      limit: 500,
      filters: PROPERTY_FILTERS,
      ...range,
    },
  ];
}

function installsByComponent(results: QueryResult[]): InstallCount[] {
  const counts = new Map<string, InstallCount>();

  const collect = (id: string, range: "lastMonth" | "sinceLaunch") => {
    for (const row of rows(results, id, EVENT_PROPERTIES)) {
      const registry = text(row.property_value);
      const count = num(row.count);
      if (!registry || count == null) continue;

      const entry = counts.get(registry) ?? {
        registry,
        lastMonth: 0,
        sinceLaunch: 0,
      };
      entry[range] += count;
      counts.set(registry, entry);
    }
  };

  collect("installsLastMonth", "lastMonth");
  collect("installsSinceLaunch", "sinceLaunch");

  return [...counts.values()].sort((a, b) => b.sinceLaunch - a.sinceLaunch);
}

function componentPages(results: QueryResult[]): PageCount[] {
  return (
    rows(results, "pages", TOP_PAGES)
      .map((row) => ({
        path: text(row.name) ?? "",
        pageviews: num(row.pageviews) ?? 0,
        visitors: num(row.visitors) ?? 0,
      }))
      .filter((page) => page.path.startsWith("/components/"))
      // top_pages ranks by visitors, the list ranks by the pageviews it shows
      .sort((a, b) => b.pageviews - a.pageviews)
  );
}

export async function fetchSiteStats(): Promise<SiteStats> {
  const results = await runQuery(statsBatch(today()));
  if (!results) return EMPTY_STATS;

  const totals = rows(results, "installTotals", EVENTS)[0];
  const installs = num(totals?.total_events);
  const byComponent = installsByComponent(results);

  return {
    pageviews: {
      lastMonth: summaryField(results, "lastMonth", "pageviews"),
      sinceLaunch: summaryField(results, "sinceLaunch", "pageviews"),
    },
    visitors: summaryField(results, "sinceLaunch", "unique_visitors"),
    sessions: summaryField(results, "sinceLaunch", "sessions"),
    installs,
    installers: num(totals?.unique_users),
    byComponent,
    topPages: componentPages(results),
  };
}
