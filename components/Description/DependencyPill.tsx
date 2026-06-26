import type { ReactNode } from "react";

type DependencyPillProps = {
  name: string;
  icon?: ReactNode;
};

export default function DependencyPill({ name, icon }: DependencyPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full  bg-muted px-4 py-2 text-sm font-medium text-foreground/90">
      {icon != null && icon !== "" && (
        <span className="flex h-4 w-4 items-center justify-center">
          {typeof icon === "string" ? (
            <img src={icon} alt="" className="h-4 w-4" />
          ) : (
            icon
          )}
        </span>
      )}
      {name}
    </span>
  );
}
