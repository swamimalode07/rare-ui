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
  const activeIndex = Math.max(
    0,
    components.findIndex((component) => pathname === component.href),
  );

  return (
    <BounceSidebar
      items={items}
      value={activeIndex}
      onChange={() => onNavigate?.()}
    />
  );
};

export default SidebarList;
