import GooeyNavbar from "@/components/GooeyNavbar";
import HeroCta from "@/components/HeroCta";

export default function Home() {
  return (
    <>
      <section className="relative w-full p-2.5">
        <div
          className="relative flex min-h-[calc(100svh-1.25rem)] w-full items-center justify-center overflow-hidden rounded-[45px]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <img
            src="/assets/landing/herobg.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full rounded-[inherit] object-cover"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-t from-background from-6% to-transparent" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-32 pt-24 text-center sm:gap-4 sm:px-6">
            <div>
              <GooeyNavbar />
            </div>
            <h1 className="max-w-4xl text-balance dark:text-white font-runde text-black text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Tasteful Components, Made to Stand Out.
            </h1>
            <p className="max-w-xl font-medium text-muted-foreground sm:text-lg">
              A collection of rare, animated components. Browse them in action
              below and install any component with shadcn CLI.
            </p>
            <HeroCta />
          </div>
        </div>
      </section>
      <DemoSection />
    </>
  );
}

const X_URL = "https://x.com/swamimalode";
const GITHUB_URL = "https://github.com/swamimalode07/rare-ui";

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
