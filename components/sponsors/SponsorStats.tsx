import { components } from "@/lib/components";
import type { Pageviews } from "@/lib/databuddy";
import {
  formatCount,
  formatViews,
  MONTHLY_PAGEVIEWS,
  TOTAL_PAGEVIEWS,
} from "@/lib/sponsors";

export default function SponsorStats({
  stars,
  pageviews,
}: {
  stars: number | null;
  pageviews: Pageviews;
}) {
  // the caption would be a lie while the fallback constants are showing
  const isLive = pageviews.lastMonth != null || pageviews.sinceLaunch != null;

  const STATS = [
    {
      value: formatViews(pageviews.lastMonth, MONTHLY_PAGEVIEWS),
      label: "Pageviews last month",
    },
    {
      value: stars ? formatCount(stars) : "Open source",
      label: "GitHub stars",
    },
    { value: `${components.length}+`, label: "Components" },
    { value: "Free", label: "For anything you build" },
    {
      value: formatViews(pageviews.sinceLaunch, TOTAL_PAGEVIEWS),
      label: "Pageviews since launch",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-20 sm:px-6 md:pt-28">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 rounded-3xl bg-card/60 px-4 py-8 text-center last:col-span-2 dark:bg-muted/60 sm:px-6 sm:py-9 lg:last:col-span-4"
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <span className="font-runde text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {stat.value}
            </span>
            <span className="text-balance text-xs font-medium text-muted-foreground sm:text-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {isLive && (
        <p className="mt-4 text-center text-xs font-medium text-muted-foreground">
          Live pageviews from databuddy.cc, our analytics sponsor. Updated
          hourly.
        </p>
      )}
    </section>
  );
}
