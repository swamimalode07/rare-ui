import { Fragment } from "react";
import Link from "next/link";
import FluidWave from "./FluidWave";

const GITHUB_URL = "https://github.com/swamimalode07/rare-ui";
const X_URL = "https://x.com/swamimalode";

type FooterLink = { label: string; href: string; external?: boolean };

const LINKS: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "GitHub", href: GITHUB_URL, external: true },
  { label: "X / Twitter", href: X_URL, external: true },
];

const UTILITY_LINKS = [
  { label: "Sitemap", href: "/sitemap.xml" },
  { label: "robots.txt", href: "/robots.txt" },
];

const HOVER =
  "transition-colors duration-150 ease-out hover:text-black dark:hover:text-white";

const MUTED = "text-black/50 dark:text-white/50";

function NavLink({ label, href, external }: FooterLink) {
  const className = `w-fit text-lg ${MUTED} ${HOVER}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      <FluidWave />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white to-transparent dark:from-black" />

      <div className="relative mx-auto flex min-h-[min(40svh,50rem)] w-full max-w-[96rem] flex-col px-6 pt-10 sm:min-h-[min(85svh,50rem)] sm:px-10 sm:pt-24 md:pt-32">
        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-wrap items-center justify-between gap-6 py-8">
          <Link href="/" className="flex h-fit w-fit items-center gap-2.5">
            <img src="/logos/Rareui.svg" alt="" className="h-8 w-8" />
            <span className="font-runde text-2xl font-bold tracking-tight">
              Rare UI
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {LINKS.map((link) => (
              <NavLink key={link.label} {...link} />
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center py-16">
          <h2 className="selection-contrast font-runde text-[clamp(3rem,12.5vw,10.5rem)] font-bold leading-[0.92] tracking-tight">
            Tasteful Components
          </h2>
        </div>

        <div
          className={`flex flex-wrap items-center justify-between gap-3 pb-8 text-xs ${MUTED}`}
        >
          <span>Rare UI &copy; {new Date().getFullYear()}</span>
          <span className="flex items-center gap-2.5">
            {UTILITY_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="text-black/25 dark:text-white/25"
                  >
                    &middot;
                  </span>
                )}
                <a href={link.href} className={HOVER}>
                  {link.label}
                </a>
              </Fragment>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
