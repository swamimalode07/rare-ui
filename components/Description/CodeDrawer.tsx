"use client";

import { useEffect, useState } from "react";
import { motion, useDragControls } from "motion/react";
import type { ComponentItem } from "@/lib/components";
import CopyButton from "../CopyButton";

type CodeDrawerProps = {
  open: boolean;
  onClose: () => void;
  item?: ComponentItem;
};

export default function CodeDrawer({ open, onClose, item }: CodeDrawerProps) {
  const dragControls = useDragControls();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !item?.registry) return;
    let cancelled = false;
    setLoading(true);
    setCode(null);
    fetch(`/api/source?name=${encodeURIComponent(item.registry)}`)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error())))
      .then((text) => !cancelled && setCode(text))
      .catch(() => !cancelled && setCode("// Unable to load source."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, item?.registry]);

  return (
    <motion.div
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 120) onClose();
      }}
      initial={false}
      animate={{ y: open ? "0%" : "110%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-x-0 bottom-0 z-10 flex h-full flex-col rounded-2xl  bg-card shadow-2xl shadow-black/30"
    >
      <div
        onPointerDown={(event) => dragControls.start(event)}
        className="shrink-0 cursor-grab touch-none px-4 pb-2 pt-3 active:cursor-grabbing"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-foreground/25" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{item?.name ?? "Code"}</span>
          {code && !loading && <CopyButton value={code} />}
        </div>
      </div>

      <pre className="mx-4 mb-4 flex-1 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs leading-relaxed text-foreground/80 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <code>{loading ? "Loading…" : code}</code>
      </pre>
    </motion.div>
  );
}
