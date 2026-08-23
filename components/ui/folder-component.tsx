"use client";

import React, { useId, useMemo, useState } from "react";
import { motion } from "motion/react";

import { BLACK, mix, parseColor, toHex, WHITE, type RGB } from "@/lib/color";
import { cn } from "@/lib/utils";

function feMatrix({ r, g, b }: RGB, a: number) {
  return `0 0 0 0 ${r / 255} 0 0 0 0 ${g / 255} 0 0 0 0 ${b / 255} 0 0 0 ${a} 0`;
}

function themeFromColor(color: string) {
  const rgb = parseColor(color);
  const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  const light = lum > 0.82;
  const flapFill =
    lum < 0.08 ? mix(rgb, 0.16, WHITE) : mix(rgb, light ? 0.04 : 0.18, BLACK);
  const flapStroke = light
    ? mix(rgb, 0.17, { r: 212, g: 212, b: 212 })
    : mix(rgb, lum < 0.08 ? 0.59 : 0.22, WHITE);

  return {
    backFill: color,
    backInsetShadow: light
      ? "inset 0 0 6px 2px rgba(178,178,178,0.25)"
      : `inset 0 0 6px 2px rgba(255,255,255,${lum < 0.08 ? 0.37 : 0.35})`,
    flapFill: toHex(flapFill),
    flapFillOpacity: light ? 0.85 : lum < 0.08 ? 0.25 : 0.45,
    flapStroke: toHex(flapStroke),
    flapInsetColor: light
      ? feMatrix({ r: 153, g: 153, b: 153 }, 0.15)
      : feMatrix(lum < 0.08 ? BLACK : WHITE, lum < 0.08 ? 0.08 : 0.12),
    cardFill: light ? "#262626" : "#F1F1F1",
    cardStroke: light ? "#404040" : "#E0E0E0",
    cardLineFill: light ? "#737373" : "#D4D4D4",
    cardInsetColor: feMatrix(WHITE, light ? 0.15 : 1),
  };
}

const sizeScales = {
  sm: 0.65,
  md: 1,
  lg: 1.35,
} as const;

type FolderComponentProps = Omit<React.ComponentProps<"div">, "color"> & {
  color?: string;
  size?: "sm" | "md" | "lg";
};

type Theme = ReturnType<typeof themeFromColor>;

const BASE_WIDTH = 321;
const BASE_HEIGHT = 270;

const FLAP_PATH =
  "M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z";

const FLAP_WIDTH = 321;
const FLAP_HEIGHT = 241;
const CARD_SPRING = { type: "spring" as const, stiffness: 120, damping: 13 };

const Papers = ({
  uid,
  theme,
  isHovered,
  isOpen,
}: {
  uid: string;
  theme: Theme;
  isHovered: boolean;
  isOpen: boolean;
}) => (
  <>
    <motion.div
      className="absolute"
      animate={{
        y: isOpen ? -160 : isHovered ? -30 : -10,
        x: isOpen ? 70 : 40,
        rotate: isOpen ? 18 : isHovered ? 14 : 10,
      }}
      transition={{
        ...CARD_SPRING,
        delay: isOpen ? 0.1 : isHovered ? 0.12 : 0,
      }}
    >
      <Card id={1} uid={uid} theme={theme} />
    </motion.div>
    <motion.div
      className="absolute"
      animate={{
        y: isOpen ? -180 : isHovered ? -35 : -20,
        x: isOpen ? 0 : 3,
        rotate: isOpen ? -3 : isHovered ? -1 : 2,
      }}
      transition={{
        ...CARD_SPRING,
        delay: isOpen ? 0.05 : isHovered ? 0.06 : 0,
      }}
    >
      <Card id={2} uid={uid} theme={theme} />
    </motion.div>
    <motion.div
      className="absolute"
      animate={{
        y: isOpen ? -170 : isHovered ? -44 : -22,
        x: isOpen ? -65 : -40,
        rotate: isOpen ? -14 : isHovered ? -9 : -5,
      }}
      transition={{
        ...CARD_SPRING,
        delay: isOpen ? 0 : 0,
      }}
    >
      <Card id={3} uid={uid} theme={theme} />
    </motion.div>
  </>
);

const FolderComponent = ({
  color = "black",
  size = "md",
  className,
  ...props
}: FolderComponentProps) => {
  const theme = useMemo(() => themeFromColor(color), [color]);
  const uid = useId().replace(/:/g, "");
  const scale = sizeScales[size];
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const flapFilterId = `folder-flap-${uid}`;
  const flapBlurId = `folder-flap-blur-${uid}`;

  return (
    <div
      data-slot="folder"
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        className,
      )}
      {...props}
    >
      <div
        className="relative cursor-pointer select-none"
        style={{
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsOpen(false);
        }}
        onClick={() => setIsOpen((o) => !o)}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            perspective: 800 * scale,
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              style={{
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
                borderRadius: 25,
                backgroundColor: theme.backFill,
                boxShadow: theme.backInsetShadow,
              }}
            />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <Papers
              uid={uid}
              theme={theme}
              isHovered={isHovered}
              isOpen={isOpen}
            />
          </div>

          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-4"
            style={{
              transformOrigin: "bottom center",
              width: FLAP_WIDTH,
              height: FLAP_HEIGHT,
            }}
            animate={{ rotateX: isOpen ? -55 : isHovered ? -45 : -15 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                clipPath: `path('${FLAP_PATH}')`,
                WebkitClipPath: `path('${FLAP_PATH}')`,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                backgroundColor: "rgb(255 255 255 / 0.01)",
              }}
            />
            <svg
              className="absolute inset-0"
              width={FLAP_WIDTH}
              height={FLAP_HEIGHT}
              viewBox="0 0 321 241"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter={`url(#${flapFilterId})`}>
                <path
                  d={FLAP_PATH}
                  fill={theme.flapFill}
                  fillOpacity={theme.flapFillOpacity}
                  filter={`url(#${flapBlurId})`}
                />
                <path
                  d="M25 0.5H136.084C142.905 0.5 149.417 3.3431 154.054 8.3457L177.713 33.874C182.539 39.0808 189.317 42.04 196.416 42.04H296C309.531 42.04 320.5 53.0092 320.5 66.54V216C320.5 229.531 309.531 240.5 296 240.5H25C11.469 240.5 0.5 229.531 0.5 216V25C0.5 11.469 11.469 0.5 25 0.5Z"
                  stroke={theme.flapStroke}
                />
              </g>
              <defs>
                <filter
                  id={flapBlurId}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <filter
                  id={flapFilterId}
                  x="-25.4"
                  y="-25.4"
                  width="371.8"
                  height="291.8"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="2.65" />
                  <feComposite
                    in2="hardAlpha"
                    operator="arithmetic"
                    k2="-1"
                    k3="1"
                  />
                  <feColorMatrix type="matrix" values={theme.flapInsetColor} />
                  <feBlend
                    mode="normal"
                    in2="shape"
                    result="effect1_innerShadow_171_13"
                  />
                </filter>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;

export { FolderComponent as Folder };
export type { FolderComponentProps };

const Card = ({
  id,
  uid,
  theme,
}: {
  id: number;
  uid: string;
  theme: Theme;
}) => {
  const filterId = `folder-card-${uid}-${id}`;
  return (
    <div data-slot="folder-card">
      <svg
        width="164"
        height="214"
        viewBox="0 0 164 214"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter={`url(#${filterId})`}>
          <rect
            width="163.078"
            height="213.262"
            rx="20"
            fill={theme.cardFill}
          />
        </g>
        <rect
          x="0.5"
          y="0.5"
          width="162.078"
          height="212.262"
          rx="19.5"
          stroke={theme.cardStroke}
        />
        <rect
          x="14.1193"
          y="31.2091"
          width="134.84"
          height="11.8892"
          rx="5.94459"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 60.9939)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 60.9617)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 75.1122)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 75.0801)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 89.2306)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 89.1985)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 103.349)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 103.317)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 117.467)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 117.435)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 131.586)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 131.554)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 145.704)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 145.672)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 159.823)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 159.79)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000409158 0.00201956 0.999998 14.8253 173.941)"
          fill={theme.cardLineFill}
        />
        <rect
          width="64.5183"
          height="5.88276"
          rx="2.94138"
          transform="matrix(1 -0.000461045 0.00179228 0.999998 84.4303 173.909)"
          fill={theme.cardLineFill}
        />
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="166.078"
            height="218.262"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius="2"
              operator="erode"
              in="SourceAlpha"
              result={`effect1_innerShadow_${id}`}
            />
            <feOffset dx="3" dy="5" />
            <feGaussianBlur stdDeviation="3.05" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values={theme.cardInsetColor} />
            <feBlend
              mode="normal"
              in2="shape"
              result={`effect1_innerShadow_${id}`}
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
