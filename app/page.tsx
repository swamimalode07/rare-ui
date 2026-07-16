import type { Metadata } from "next";
import FlowerShader from "@/components/FlowerShader";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroCta from "@/components/HeroCta";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <section className="relative w-full p-2.5">
        <div
          className="relative flex min-h-[calc(100svh-1.25rem)] w-full items-center justify-center overflow-hidden rounded-[45px]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60svh] bg-[radial-gradient(62%_95%_at_50%_100%,rgba(252,76,1,0.16),transparent_70%)]" />
          <FlowerShader className="pointer-events-none absolute bottom-0 left-1/2 w-[min(170svh,112vw)] -translate-x-1/2 translate-y-[52%]" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-44 pt-24 text-center sm:gap-4 sm:px-6">
            <div>
              <GooeyNavbar />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/35 py-1.5 pl-4 pr-3.5 backdrop-blur-xl dark:bg-neutral-950/30">
              <span className="font-runde text-sm font-medium text-black dark:text-white">
                Backed by
              </span>
              <a
                href="https://www.databuddy.cc"
                target="_blank"
                rel="noreferrer"
                aria-label="Databuddy"
              >
                <img
                  src="/logos/databuddydark.svg"
                  alt="Databuddy"
                  className="h-4.5 w-auto dark:hidden"
                />
                <img
                  src="/logos/databuddywhite.svg"
                  alt="Databuddy"
                  className="hidden h-4.5 w-auto dark:block"
                />
              </a>
            </div>
            <h1 className="max-w-4xl text-balance dark:text-white font-runde text-black text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Tasteful Components, Made to Stand Out.
            </h1>
            <p className="max-w-xl font-medium text-muted-foreground sm:text-lg [text-shadow:0_1px_2px_rgba(255,255,255,0.5)] dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              A collection of rare, animated components. Browse them in action
              below and install any component with shadcn CLI.
            </p>
            <HeroCta />
          </div>
        </div>
      </section>
      <BackersSection />
      <DemoSection />
    </>
  );
}

const X_URL = "https://x.com/swamimalode";
const GITHUB_URL = "https://github.com/swamimalode07/rare-ui";
const SPONSOR_URL = "https://github.com/sponsors/swamimalode07";

function SponsorSlot() {
  return (
    <a
      href={SPONSOR_URL}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-24 w-full items-center justify-center sm:h-32"
    >
      <span className="flex items-center gap-2.5 text-muted-foreground/70 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-[0.98] group-hover:opacity-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="text-sm font-medium">Your logo here</span>
      </span>
      <span className="absolute inset-0 flex translate-y-0.5 items-center justify-center gap-2 opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:translate-y-0 group-hover:opacity-100">
        <span className="font-runde text-sm font-semibold">
          Take this slot
        </span>
        <span aria-hidden="true" className="text-[#FC4C01]">
          &#10084;
        </span>
      </span>
    </a>
  );
}

function BackersSection() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 py-24 text-center">
      <h2 className="max-w-2xl text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl">
        Rare UI is backed and supported by the finest
      </h2>
      <div className="relative w-full border-y border-border">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Backed by
        </span>
        <div className="grid w-full grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <a
            href="https://www.databuddy.cc"
            target="_blank"
            rel="noreferrer"
            className="flex h-24 items-center justify-center sm:h-32"
          >
            <img
              src="/logos/databuddydark.svg"
              alt="Databuddy"
              className="h-10 w-auto dark:hidden sm:h-12"
            />
            <img
              src="/logos/databuddywhite.svg"
              alt="Databuddy"
              className="hidden h-10 w-auto dark:block sm:h-12"
            />
          </a>
          <SponsorSlot />
          <SponsorSlot />
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FC4C01] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FC4C01]" />
        </span>
        Work in progress
      </span>
      <h2 className="max-w-2xl text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        Rare UI is being built in the open.
      </h2>
      <p className="max-w-xl text-balance font-medium text-muted-foreground sm:text-lg">
        The landing page you&apos;re on is still taking shape, and new
        components land regularly. Follow the journey on X and star the
        project on GitHub to keep up.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <a
          href={X_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center gap-2.5 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-neutral-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
          </svg>
          Follow the journey
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center gap-2.5 rounded-full border border-border bg-card px-6 text-sm font-semibold transition-colors duration-150 ease-out hover:bg-muted"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FC4C01"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
          Star on GitHub
        </a>
      </div>
    </section>
  );
}
