"use client";

import DiwaliLogo from "@/components/DiwaliLogo";
import HalloweenLogo from "@/components/HalloweenLogo";
import { useDiwali } from "@/lib/diwali";
import { useHalloween } from "@/lib/halloween";
import { DIWALI_LOGO_ENABLED, HALLOWEEN_LOGO_ENABLED } from "@/lib/site";

export default function NavLogo({ hovered }: { hovered: boolean }) {
  const diwali = useDiwali(DIWALI_LOGO_ENABLED);
  const halloween = useHalloween(HALLOWEEN_LOGO_ENABLED);

  if (diwali) return <DiwaliLogo hovered={hovered} />;
  if (halloween) return <HalloweenLogo hovered={hovered} />;
  return <img src="/logos/Rareui.svg" alt="" className="h-5 w-5" />;
}
