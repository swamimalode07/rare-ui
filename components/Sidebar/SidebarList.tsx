"use client";

import { usePathname } from "next/navigation";
import { BounceSidebar } from "@/components/ui/bounce-sidebar";
import { navSections } from "@/lib/components";

const items = navSections.flatMap((section) =>
  section.items.map((component) => ({
    label: component.name,
    href: component.href,
    group: section.label,
  })),
);

const SidebarList = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => pathname === item.href),
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
