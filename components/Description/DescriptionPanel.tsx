"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CodeXml, Maximize, Minimize } from "lucide-react";
import { activeComponent, PANEL_INFO } from "@/lib/components";
import CopyButton from "../CopyButton";
import CodeDrawer from "./CodeDrawer";
import PanelCode from "./PanelCode";
import InstallCommand from "./InstallCommand";
import DependencyPill from "./DependencyPill";
import PropsTable from "./PropsTable";
import ThemeToggle from "../ThemeToggle";
import { MailIcon, XIcon } from "./icons";

const PANEL_SHIFT = 600;

type DescriptionPanelProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-normal text-foreground/40">
      {children}
    </p>
  );
}

export function DescriptionPanel({ open, setOpen }: DescriptionPanelProps) {
  const pathname = usePathname();
  const item = activeComponent(pathname);

  const [codeOpen, setCodeOpen] = useState(false);
  useEffect(() => {
    if (!open) setCodeOpen(false);
  }, [open]);

  const toggleCode = () => {
    if (codeOpen) {
      setCodeOpen(false);
    } else {
      setOpen(true);
      setCodeOpen(true);
    }
  };

  return (
    <div className="pointer-events-none absolute right-0 top-0 z-40 h-full">
      <div className="pointer-events-auto absolute top-4 right-4 z-50 flex items-center gap-2 rounded-2xl border-apple bg-muted p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close description" : "Open description"}
          className="cursor-pointer rounded-full bg-popover p-1"
        >
          {open ? (
            <Maximize className="h-5 w-5" />
          ) : (
            <Minimize className="h-5 w-5" />
          )}
        </button>

        {item?.registry && (
          <button
            type="button"
            onClick={toggleCode}
            aria-label={codeOpen ? "Hide code" : "Get code"}
            className="cursor-pointer rounded-full bg-popover p-1"
          >
            <CodeXml className="h-5 w-5" />
          </button>
        )}

        <ThemeToggle className="rounded-full p-1 bg-popover" />
      </div>

      <motion.div
        initial={false}
        animate={{ x: open ? 0 : PANEL_SHIFT }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="pointer-events-auto relative flex h-full w-140 flex-col overflow-hidden rounded-2xl bg-background"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background to-transparent" />

        <div className="no-scrollbar flex flex-1 flex-col gap-12 overflow-y-auto p-8 pt-60 text-left">
          <div className="flex flex-col gap-4">
            <SectionLabel>{item?.name ?? "Component"}</SectionLabel>
            <p className="text-2xl font-semibold leading-relaxed font-sans text-foreground/90">
              {item?.description ?? "This component is not available yet."}
            </p>
          </div>

          {item?.dependencies && item.dependencies.length > 0 && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Dependencies</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {item.dependencies.map((dep) => (
                  <DependencyPill
                    key={dep.name}
                    name={dep.name}
                    icon={dep.icon}
                  />
                ))}
              </div>
            </div>
          )}

          {item?.interaction && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Interaction Type</SectionLabel>
              <p className="text-sm leading-relaxed text-foreground/70">
                {item.interaction}
              </p>
            </div>
          )}

          {item?.props && item.props.length > 0 && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Props</SectionLabel>
              <p className="-mt-1 text-sm leading-relaxed text-foreground/70">
                Options you can pass to customize this component.
              </p>
              <PropsTable props={item.props} />
            </div>
          )}

          {item?.registry && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Installation</SectionLabel>
              <InstallCommand item={item} />
            </div>
          )}

          {item?.usage && (
            <div className="flex flex-col gap-3">
              <SectionLabel>How to use</SectionLabel>
              <PanelCode code={item.usage} className="rounded-lg p-4" />
            </div>
          )}

          {item?.registry && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Source Code</SectionLabel>
              <p className="text-sm leading-relaxed text-foreground/70">
                {PANEL_INFO.sourceHint}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <SectionLabel>Keep in mind</SectionLabel>
            <p className="text-sm leading-relaxed text-foreground/70">
              {PANEL_INFO.keepInMind}
            </p>
          </div>

          {item?.credits && item.credits.length > 0 && (
            <div className="flex flex-col gap-3">
              <SectionLabel>Credits</SectionLabel>

              <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/70">
                {item.credits.map((credit) => (
                  <li key={credit} className="flex gap-2">
                    <span className="text-foreground/40">•</span>
                    <span>{credit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <SectionLabel>Contact</SectionLabel>
            <p className="text-sm leading-relaxed text-foreground/70">
              {PANEL_INFO.contactNote}
            </p>
            <div className="flex items-center gap-2">
              <CopyButton
                value={PANEL_INFO.contactEmail}
                label={`Copy email (${PANEL_INFO.contactEmail})`}
                idleIcon={<MailIcon />}
                iconClassName="size-5"
                className="size-8 hover:text-foreground"
              />
              <a
                href="https://x.com/swamimalode"
                target="_blank"
                rel="noreferrer"
                aria-label="X — @swamimalode"
                title="@swamimalode"
                className="inline-flex size-8 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
              >
                <XIcon className="size-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <SectionLabel>License & Usage</SectionLabel>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/70">
              {PANEL_INFO.license.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-foreground/40">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CodeDrawer
          open={codeOpen}
          onClose={() => setCodeOpen(false)}
          item={item}
        />
      </motion.div>
    </div>
  );
}
