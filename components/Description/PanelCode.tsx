"use client";

import CodeBlock from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

type PanelCodeProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
};

/**
 * Shared code surface for the description panel and code drawer: a frameless
 * CodeBlock that follows the site theme, on the panel's muted background.
 */
export default function PanelCode({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
}: PanelCodeProps) {
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-xl bg-muted p-3",
        className,
      )}
    >
      <CodeBlock
        code={code}
        language={language}
        showFrame={false}
        showLineNumbers={showLineNumbers}
        className="min-h-0 w-full flex-1"
      />
    </div>
  );
}
