"use client";

import CodeBlock from "@/components/ui/code-block";
import { useIsMobile } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type PanelCodeProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
};

// shared code surface for the panel + drawer
export default function PanelCode({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
}: PanelCodeProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex overflow-hidden",
        !isMobile && "rounded-xl bg-muted p-3",
        className,
        isMobile && "p-0",
      )}
    >
      <CodeBlock
        code={code}
        language={language}
        showFrame={isMobile}
        showLineNumbers={showLineNumbers}
        className="min-h-0 w-full flex-1"
      />
    </div>
  );
}
