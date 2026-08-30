import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeMiterlimit: 10,
} as const;

export function HouseIcon(props: IconProps) {
  return (
    // 32 viewBox against the others' 24, so the stroke is scaled to match weight
    <svg viewBox="0 0 32 32" strokeWidth={2.67} {...base} {...props}>
      <polyline points="2 13 16 2 30 13" strokeLinecap="square" />
      <polyline points="13 29 13 20 19 20 19 29" />
      <path
        d="m5,16v10c0,1.657,1.343,3,3,3h16c1.657,0,3-1.343,3-3v-10"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} {...base} {...props}>
      <line x1="12" y1="6" x2="12" y2="21" />
      <path
        d="m17.5,3c-3,0-5.5,1.3-5.5,3,0-1.7-2.5-3-5.5-3S1,4.3,1,6v15c0-1.7,2.5-3,5.5-3s5.5,1.3,5.5,3c0-1.7,2.5-3,5.5-3s5.5,1.3,5.5,3V6c0-1.7-2.5-3-5.5-3Z"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="square" {...base} {...props}>
      <path d="M8 6V2H16V6" />
      <path d="M10 13H4C2.89543 13 2 12.1046 2 11V6H22V11C22 12.1046 21.1046 13 20 13H14" />
      <path d="M2 17V21H22V17" />
      <path d="M14 12H10V15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15V12Z" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="square" {...base} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m12,17v-5.5c0-.276-.224-.5-.5-.5h-1.5" />
      <circle cx="12" cy="7.25" r="1.25" fill="currentColor" strokeWidth={0} />
    </svg>
  );
}
