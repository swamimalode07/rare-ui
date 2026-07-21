"use client";

import { useIsMobile } from "@/lib/use-media-query";
import DesktopShell from "./DesktopShell";
import MobileShell from "./MobileShell";
import { PreviewControlsProvider } from "../preview/PreviewControls";

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <PreviewControlsProvider>
      {isMobile ? (
        <MobileShell>{children}</MobileShell>
      ) : (
        <DesktopShell>{children}</DesktopShell>
      )}
    </PreviewControlsProvider>
  );
}
