"use client";

import { usePathname } from "next/navigation";
import { BounceSidebar } from "@/components/ui/bounce-sidebar";
import { components } from "@/lib/components";

const items = components.map((component) => ({
  label: component.name,
  href: component.href,
}));

const SidebarList = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const matchedIndex = components.findIndex(
    (component) => pathname === component.href,
  );

  return (
    <BounceSidebar
      items={items}
      value={matchedIndex}
      onChange={() => onNavigate?.()}
    />
  );
};

export default SidebarList;
