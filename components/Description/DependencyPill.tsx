import type { ReactNode } from "react";

type DependencyPillProps = {
  name: string;
  icon?: ReactNode;
};

export default function DependencyPill({ name, icon }: DependencyPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl  bg-muted px-3 py-1.5 text-sm font-medium text-foreground/90">
      {icon != null && icon !== "" && (
        <span className="flex h-5 w-5 items-center justify-center">
          {typeof icon === "string" ? (
            <img src={icon} alt="" className="h-5 w-5" />
          ) : (
            icon
          )}
        </span>
      )}
      {name}
    </span>
  );
}
