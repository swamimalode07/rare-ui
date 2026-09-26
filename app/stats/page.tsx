import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import StatGrid, { type Stat } from "@/components/stats/StatGrid";
import RankedList, { type RankedRow } from "@/components/stats/RankedList";
import {
  activeComponent,
  components,
  registryComponent,
} from "@/lib/components";
import { fetchSiteStats } from "@/lib/databuddy";
import { fetchStarCount } from "@/lib/github";
import { formatNumber } from "@/lib/utils";

// unlisted page, no description or og tags so it stays out of search and link previews
export const metadata: Metadata = {
  title: "Stats",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const VIEW_LIMIT = 12;

function show(value: number | null) {
  return value == null ? "No data" : formatNumber(value);
}

export default async function StatsPage() {
  const [stars, stats] = await Promise.all([
    fetchStarCount(),
    fetchSiteStats(),
  ]);

  // the cli also fetches registry dependencies like utils, those are not installs of a component
  const documented = stats.byComponent.flatMap((entry) => {
    const item = registryComponent(entry.registry);
    return item ? [{ entry, item }] : [];
  });

  const installTotal =
    stats.installs == null
      ? null
      : documented.reduce((sum, { entry }) => sum + entry.sinceLaunch, 0);

  const tiles: Stat[] = [
    {
      value: show(stats.pageviews.sinceLaunch),
      label: "Pageviews since launch",
    },
    { value: show(stats.pageviews.lastMonth), label: "Pageviews last 30 days" },
    { value: show(stats.visitors), label: "Visitors since launch" },
    { value: show(stats.sessions), label: "Sessions since launch" },
    { value: show(stars), label: "GitHub stars" },
    { value: formatNumber(components.length), label: "Components" },
    { value: show(installTotal), label: "CLI installs" },
    { value: show(stats.installers), label: "Machines installed on" },
  ];

  const installRows: RankedRow[] = documented.map(({ entry, item }) => ({
    id: entry.registry,
    label: item.name,
    href: item.href,
    value: entry.sinceLaunch,
    meta: `${formatNumber(entry.lastMonth)} last 30 days`,
  }));

  const viewRows: RankedRow[] = stats.topPages
    .flatMap((page) => {
      const item = activeComponent(page.path);
      if (!item) return [];
      return [
        {
          id: page.path,
          label: item.name,
          href: item.href,
          value: page.pageviews,
          meta: `${formatNumber(page.visitors)} visitors`,
        },
      ];
    })
    .slice(0, VIEW_LIMIT);

  const isLive = stats.pageviews.sinceLaunch != null;

  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(78svh,50rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <GooeyNavbar stars={stars} />

          <img
            src="/logos/Rareui.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[68%] w-[860px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05] [filter:brightness(0)] dark:opacity-[0.07] dark:[filter:brightness(0)_invert(1)]"
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(255,255,255,0.07),transparent_60%)] dark:block" />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-20 pt-28 text-center sm:gap-4 sm:px-6">
            <HeroIntro
              headline="Stats"
              sub="Traffic and install numbers for Rare UI."
            >
              <a
                href="#overview"
                className="flex flex-col items-center gap-2 font-runde text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
              >
                Scroll to the numbers
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 animate-bounce motion-reduce:animate-none"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </a>
            </HeroIntro>
          </div>
        </div>
      </section>

      <main className="flex-1 pb-20 md:pb-28">
        <section
          id="overview"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pt-20 sm:px-6 md:pt-28"
        >
          <StatGrid stats={tiles} />

          {isLive && (
            <p className="mt-4 text-center text-xs font-medium text-muted-foreground">
              Live numbers from databuddy.cc, our analytics sponsor. Updated
              hourly.
            </p>
          )}
        </section>

        <Section
          title="Installs by component"
          description="Counted when the shadcn CLI fetches a component from the registry. One machine counts once per day."
        >
          {installRows.length > 0 ? (
            <RankedList rows={installRows} unit="installs" />
          ) : (
            <Empty>No installs recorded yet.</Empty>
          )}
        </Section>

        <Section
          title="Most viewed components"
          description="Pageviews on component pages since launch."
        >
          {viewRows.length > 0 ? (
            <RankedList rows={viewRows} unit="views" />
          ) : (
            <Empty>No pageviews recorded yet.</Empty>
          )}
        </Section>
      </main>

      <Footer />
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 pt-20 sm:px-6 md:pt-28">
      <div className="mb-6 flex flex-col gap-1.5">
        <h2 className="text-balance font-runde text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-balance text-sm font-medium text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <div
      className="rounded-2xl bg-card/60 px-5 py-8 text-center text-sm font-medium text-muted-foreground dark:bg-muted/60"
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
