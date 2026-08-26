import { cn } from "@/lib/utils";
import {
  PLATFORM_CARD_HEIGHT,
  PLATFORM_CARD_WIDTH,
  PLATFORM_SPONSORS,
  PLATFORM_TIER_BLURB,
  PLATFORM_TIER_NAME,
  TIERS_HREF,
  TIER_CARD_HEIGHT,
  TIER_CARD_WIDTH,
  type PlatformSponsor,
  type Sponsor,
  type SponsorBrand,
  type SponsorTierId,
  sponsorsByTier,
} from "@/lib/sponsors";

const CARD =
  "flex w-full items-center justify-center rounded-3xl bg-card/60 px-6 transition-colors duration-150 ease-out hover:bg-card dark:bg-muted/60 dark:hover:bg-muted";

const LAYER =
  "col-start-1 row-start-1 flex items-center justify-center gap-2.5 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SponsorLogo({
  sponsor,
  className,
}: {
  sponsor: SponsorBrand;
  className: string;
}) {
  return (
    <>
      <img
        src={sponsor.lightSrc}
        alt={sponsor.name}
        className={`${className} w-auto dark:hidden`}
      />
      <img
        src={sponsor.darkSrc}
        alt={sponsor.name}
        className={`hidden w-auto dark:block ${className}`}
      />
    </>
  );
}

export function SponsorCard({
  sponsor,
  height,
  className,
}: {
  sponsor: Sponsor;
  height: string;
  className?: string;
}) {
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className={cn(CARD, height, className)}
    >
      <SponsorLogo
        sponsor={sponsor}
        className={`${sponsor.logoHeight} max-w-full object-contain`}
      />
    </a>
  );
}

export function PlatformSponsorCard({
  sponsor,
  height = PLATFORM_CARD_HEIGHT,
  className,
}: {
  sponsor: PlatformSponsor;
  height?: string;
  className?: string;
}) {
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className={cn(CARD, height, "flex-col gap-3", className)}
    >
      <SponsorLogo
        sponsor={sponsor}
        className={`${sponsor.logoHeight} max-w-full object-contain`}
      />
      <span className="font-runde text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {sponsor.role}
      </span>
    </a>
  );
}

export function PlatformTierGroup() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-center font-runde text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {PLATFORM_TIER_NAME}
        </h2>
        <p className="max-w-md text-balance text-center text-sm text-muted-foreground/70">
          {PLATFORM_TIER_BLURB}
        </p>
      </div>
      <div className="flex w-full flex-wrap justify-center gap-4">
        {PLATFORM_SPONSORS.map((sponsor) => (
          <PlatformSponsorCard
            key={sponsor.name}
            sponsor={sponsor}
            className={PLATFORM_CARD_WIDTH}
          />
        ))}
      </div>
    </div>
  );
}

export function OpenSlotCard({
  height,
  label = "Your logo here",
  hoverLabel = "Take this slot",
  className,
}: {
  height: string;
  label?: string;
  hoverLabel?: string;
  className?: string;
}) {
  return (
    <a
      href={TIERS_HREF}
      className={cn(CARD, height, "group relative", className)}
    >
      <span className="grid overflow-hidden whitespace-nowrap text-sm font-medium">
        <span
          className={cn(
            LAYER,
            "text-muted-foreground/70 group-hover:-translate-y-full group-hover:opacity-0",
          )}
        >
          <PlusIcon />
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            LAYER,
            "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <PlusIcon className="rotate-90" />
          <span>
            <span className="font-runde font-semibold">{hoverLabel}</span>{" "}
            <span className="text-[#FC4C01]">&#10084;</span>
          </span>
        </span>
      </span>
    </a>
  );
}

export function TierGroup({
  tier,
  name,
  emptyLabel,
}: {
  tier: SponsorTierId;
  name: string;
  emptyLabel?: string;
}) {
  const sponsors = sponsorsByTier(tier);
  const height = TIER_CARD_HEIGHT[tier];
  const width = TIER_CARD_WIDTH[tier];
  const empty = sponsors.length === 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-center font-runde text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {name}
      </h2>
      <div className="flex w-full flex-wrap justify-center gap-4">
        {sponsors.map((sponsor) => (
          <SponsorCard
            key={sponsor.name}
            sponsor={sponsor}
            height={height}
            className={width}
          />
        ))}
        <OpenSlotCard
          height={height}
          className={width}
          label={empty && emptyLabel ? emptyLabel : undefined}
          hoverLabel={empty && emptyLabel ? "Claim it" : undefined}
        />
      </div>
    </div>
  );
}
