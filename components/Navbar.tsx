"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Components", href: "/components" },
  { label: "Sponsors", href: "/sponsors" },
];

const GITHUB_URL = "https://github.com/swamimalode07/rare-ui";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.04 11.04 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!pressed) return;
    const release = () => setPressed(null);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pressed]);

  const pill = cn(
    "pointer-events-auto flex h-10 items-center rounded-full",
    "bg-white/60 backdrop-blur-2xl backdrop-saturate-150 dark:bg-white/[0.07]",
    "shadow-[0_12px_32px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)]",
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-50">
      <motion.nav
        animate={{ scale: scrolled ? 0.98 : 1, y: scrolled ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, mass: 0.8 }}
        onMouseLeave={() => setHovered(null)}
        className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className={cn(
            pill,
            "gap-2 px-4 font-[family-name:var(--font-open-runde)] text-sm font-semibold text-foreground",
          )}
        >
          <img src="/logos/Rareui.svg" alt="" className="h-5 w-5" />
          Rare UI
        </Link>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          {LINKS.map((link) => {
          const active = pathname === link.href;
          const bumped = hovered ? hovered === link.href : active;
          return (
            <Link
              key={link.href}
              href={link.href}
              draggable={false}
              onMouseEnter={() => setHovered(link.href)}
              onPointerDown={() => {
                setPressed(link.href);
                setHovered(link.href);
              }}
              onPointerUp={() => {
                if (pressed && pressed !== link.href) router.push(link.href);
              }}
              className={cn(
                pill,
                "relative select-none px-4 text-sm transition-colors duration-200",
                active || hovered === link.href
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <AnimatePresence>
                {bumped && (
                  <motion.span
                    layoutId="nav-glass-bump"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      scaleX: pressed ? 1.22 : 1,
                      scaleY: pressed ? 1.28 : 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    className={cn(
                      "absolute inset-0 rounded-full",
                      "bg-black/[0.05] dark:bg-white/[0.08]",
                      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),inset_0_-1px_2px_0_rgba(0,0,0,0.05)]",
                      "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-1px_2px_0_rgba(0,0,0,0.3)]",
                      pressed &&
                        "bg-black/[0.08] backdrop-blur-sm dark:bg-white/[0.12]",
                    )}
                  />
                )}
              </AnimatePresence>
              <motion.span
                animate={{ scale: bumped && pressed ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative inline-block"
              >
                {link.label}
              </motion.span>
            </Link>
          );
        })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={cn(
              pill,
              "w-10 justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground",
            )}
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          <ThemeToggle
            className={cn(
              pill,
              "w-10 justify-center p-0 text-muted-foreground hover:text-foreground [&_svg]:h-4 [&_svg]:w-4",
            )}
          />
        </div>
      </motion.nav>
    </div>
  );
}
