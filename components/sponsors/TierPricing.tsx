import SponsorCta from "@/components/sponsors/SponsorCta";
import { TIERS, type SponsorTier } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

function CheckIcon({ featured }: { featured?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "mt-0.5 size-3.5 shrink-0",
        featured ? "text-[#FC4C01]" : "text-muted-foreground/45",
      )}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function TierCard({ tier }: { tier: SponsorTier }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-6 rounded-[44px] bg-card/60 p-7 dark:bg-muted/60",
        tier.featured && "ring-1 ring-[#FC4C01] dark:bg-muted",
      )}
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      {tier.featured && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FC4C01] px-3 py-1 font-runde text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          Most impact
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        <h3 className="font-runde text-lg font-bold tracking-tight">
          {tier.name}
        </h3>

        <p className="font-runde text-4xl font-bold tracking-tight">
          <span className="align-top text-xl">$</span>
          {tier.price}
          <span className="ml-0.5 text-base font-medium text-muted-foreground">
            /month
          </span>
        </p>
      </div>

      <div
        className={cn(
          "h-px w-full",
          tier.featured ? "bg-[#FC4C01]/20" : "bg-foreground/[0.08]",
        )}
      />

      <ul
        className={cn(
          "flex flex-1 flex-col gap-2.5 text-sm",
          tier.featured ? "text-foreground/80" : "text-muted-foreground",
        )}
      >
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <CheckIcon featured={tier.featured} />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <SponsorCta
        href={tier.checkoutUrl}
        variant={tier.featured ? "solid" : "subtle"}
        className="w-full"
      >
        Sponsor as {tier.name}
      </SponsorCta>
    </div>
  );
}

export default function TierPricing() {
  return (
    <section
      id="tiers"
      className="mx-auto flex w-full max-w-6xl scroll-mt-28 flex-col items-center gap-10 px-5 py-20 sm:px-6 md:py-28"
    >
      <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
        <h2 className="text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl">
          Power a growing open-source UI library
        </h2>
        <p className="text-balance font-medium text-muted-foreground sm:text-lg">
          Pick a tier, get your logo in front of the developers building with
          Rare UI. Cancel anytime.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </section>
  );
}
