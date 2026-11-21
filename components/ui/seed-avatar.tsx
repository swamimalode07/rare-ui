import type { ComponentProps } from "react";
import {
  createAvatar,
  toDataUri,
  type AvatarShape,
  type AvatarStyle,
} from "@rareuihq/avatars";
import { cn } from "@/lib/utils";

const SHAPES: Record<AvatarShape, string> = {
  circle: "rounded-full",
  squircle: "rounded-[28%]",
  square: "rounded-none",
};

export type SeedAvatarProps = Omit<ComponentProps<"img">, "src"> & {
  seed: string;
  variant?: AvatarStyle;
  shape?: AvatarShape;
  size?: number;
};

function SeedAvatar({
  seed,
  variant = "faces",
  shape = "circle",
  size = 40,
  alt = "",
  className,
  ...props
}: SeedAvatarProps) {
  return (
    // a data uri gains nothing from next/image
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="seed-avatar"
      src={toDataUri(createAvatar(variant, seed, { size }))}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      className={cn("shrink-0 select-none", SHAPES[shape], className)}
      {...props}
    />
  );
}

export default SeedAvatar;
