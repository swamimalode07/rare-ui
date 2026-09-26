export type Stat = {
  value: string;
  label: string;
};

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1 rounded-3xl bg-card/60 px-4 py-8 text-center dark:bg-muted/60 sm:px-6 sm:py-9"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <span className="font-runde text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {stat.value}
          </span>
          <span className="text-balance text-xs font-medium text-muted-foreground sm:text-sm">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
