"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { OPEN_EVENT } from "./CommandMenuTrigger";

const CommandMenu = dynamic(() => import("./CommandMenu"), { ssr: false });

export function CommandMenuLoader() {
  const [requested, setRequested] = useState(false);

  // once loaded, the menu owns these shortcuts, so this listener steps aside
  useEffect(() => {
    if (requested) return;
    const request = () => setRequested(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key?.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      request();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, request);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, request);
    };
  }, [requested]);

  return requested ? <CommandMenu initialOpen /> : null;
}
