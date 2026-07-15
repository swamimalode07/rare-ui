import { Fragment } from "react";
import type { ComponentProp } from "@/lib/components";

type PropsTableProps = {
  props: ComponentProp[];
};

// "a" | "b" unions read better as one option per line,
// but leave object/generic types alone — their | isn't top-level
function typeLines(prop: ComponentProp) {
  if (prop.options) return prop.options;
  if (/[{<(]/.test(prop.type)) return [prop.type];
  return prop.type.split(/\s\|\s/);
}

export default function PropsTable({ props }: PropsTableProps) {
  return (
    <div className="grid grid-cols-[max-content_fit-content(10rem)_1fr]">
      {["Prop", "Type", "Description"].map((label) => (
        <div
          key={label}
          className="border-b border-border/50 px-1 pb-2.5 pr-4 text-[10px] font-medium uppercase tracking-wider text-foreground/45"
        >
          {label}
        </div>
      ))}

      {props.map((prop) => (
        <Fragment key={prop.name}>
          <div className="border-b border-border/40 py-4 pl-1 pr-4">
            <code className="inline-flex items-center whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground/75">
              {prop.name}
              {prop.required && <span className="text-[#FC4C01]">*</span>}
            </code>
          </div>

          <div className="flex flex-col gap-1 border-b border-border/40 py-4 pt-5 pr-4">
            {typeLines(prop).map((value) => (
              <code
                key={value}
                className="font-mono text-xs leading-relaxed text-foreground/55"
              >
                {value}
              </code>
            ))}
          </div>

          <div className="border-b border-border/40 px-1 py-4">
            <p className="pt-0.5 text-sm leading-relaxed text-foreground/90">
              {prop.description}
            </p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
