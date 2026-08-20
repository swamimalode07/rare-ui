import { components } from "@/lib/components";
import { MONTHLY_PAGEVIEWS } from "@/lib/sponsors";

function formatStars(stars: number) {
  return stars >= 1000 ? `${(stars / 1000).toFixed(1)}K+` : `${stars}`;
}

export default function SponsorStats({ stars }: { stars: number | null }) {
  const STATS = [
    { value: MONTHLY_PAGEVIEWS, label: "Pageviews last month" },
    { value: stars ? formatStars(stars) : "Open source", label: "GitHub stars" },
    { value: `${components.length}+`, label: "Components" },
    { value: "MIT", label: "Free forever" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6 md:pb-28">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 rounded-3xl bg-card/60 px-4 py-8 text-center dark:bg-muted/60 sm:px-6 sm:py-9"
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
    </section>
  );
}
