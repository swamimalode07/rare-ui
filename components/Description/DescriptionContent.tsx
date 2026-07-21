"use client";

import { type ComponentItem, PANEL_INFO } from "@/lib/components";
import { cn } from "@/lib/utils";
import CopyButton from "../CopyButton";
import Tooltip from "../Tooltip";
import PanelCode from "./PanelCode";
import InstallCommand from "./InstallCommand";
import DependencyPill from "./DependencyPill";
import PropsTable from "./PropsTable";
import { MailIcon, XIcon } from "./icons";

type DescriptionContentProps = {
  item?: ComponentItem;
  showSourceHint?: boolean;
  className?: string;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-normal text-foreground/40">
      {children}
    </p>
  );
}

export default function DescriptionContent({
  item,
  showSourceHint = true,
  className,
}: DescriptionContentProps) {
  return (
    <div className={cn("flex flex-col gap-12 text-left", className)}>
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
              <DependencyPill key={dep.name} name={dep.name} icon={dep.icon} />
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

      {item?.registry && showSourceHint && (
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
          <Tooltip label={PANEL_INFO.contactEmail} align="start">
            <CopyButton
              value={PANEL_INFO.contactEmail}
              label={`Copy email (${PANEL_INFO.contactEmail})`}
              title=""
              idleIcon={<MailIcon />}
              iconClassName="size-5"
              className="size-8 hover:text-foreground"
            />
          </Tooltip>
          <Tooltip label="@swamimalode">
            <a
              href="https://x.com/swamimalode"
              target="_blank"
              rel="noreferrer"
              aria-label="X — @swamimalode"
              className="inline-flex size-8 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
            >
              <XIcon className="size-5" />
            </a>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel>License &amp; Usage</SectionLabel>
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
  );
}
