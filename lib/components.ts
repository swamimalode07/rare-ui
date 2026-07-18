import { createElement, type ReactNode } from "react";
import { MotionIcon } from "@/components/Description/icons";

export type Dependency = {
  name: string;
  icon?: ReactNode;
};

export type ComponentProp = {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  options?: string[];
  control?: "swatch";
  optionColors?: Record<string, string>;
  description: string;
};

export type ComponentItem = {
  name: string;
  href: string;
  description?: string;
  registry?: string;
  source?: string;
  dependencies?: Dependency[];
  interaction?: string;
  usage?: string;
  props?: ComponentProp[];
  credits?: string[];
};

export const REGISTRY_HOMEPAGE = "https://github.com/swamimalode07/rare-ui";
export const REGISTRY_REPO = "swamimalode07/rare-ui";

export const PANEL_INFO = {
  sourceHint:
    "Click the code icon in the top-right corner to view the source code.",
  keepInMind:
    "Most components here are recreations of great work from around the web. I don't claim to be the original creator - this is my attempt to reverse-engineer, replicate, and often add a few extra features. I've tried to credit everyone; if I missed someone, let me know.",
  contactEmail: "swamimalodeofficial@gmail.com",
  contactNote: "Found a bug or issue? Feel free to drop a DM.",
  license: [
    "Free to use and modify in both personal and commercial projects.",
    "Attribution to Rare UI is appreciated when using a component.",
    "Please don't resell the components as your own kit.",
  ],

} as const;

export const components: ComponentItem[] = [
  {
    name: "Folder component",
    href: "/components/foldercomponent",
    registry: "folder-component",
    description:
      "An animated folder whose cards fan out on hover and lift open on click, with a 3D-tilted flap. Supports color and size (sm/md/lg) props.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/folder-component.tsx`,
    dependencies: [
      { name: "motion", icon: createElement(MotionIcon, { className: "h-4 w-4" }) },
    ],
    interaction:
      "Hover to fan the cards out, then click to lift the folder open.",
    props: [
      {
        name: "color",
        type: '"black" | "white" | "blue"',
        default: '"black"',
        options: ["black", "white", "blue"],
        control: "swatch",
        optionColors: {
          black: "#000000",
          white: "#ffffff",
          blue: "#50B1FD",
        },
        description:
          "Color theme of the folder, flap, and cards. Each theme sets matching fills, strokes, and inner shadows.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        options: ["sm", "md", "lg"],
        description:
          "Overall scale of the folder. Maps to 0.65× (sm), 1× (md), and 1.35× (lg).",
      },
    ],
    usage: `import { Folder } from "@/components/ui/folder-component",

export function Demo() {
  return <Folder color="blue" size="md" />
}`,
  },
  {
    name: "Bounce sidebar",
    href: "/components/bouncesidebar",
    registry: "bounce-sidebar",
    description:
      "A vertical navigation list with a bouncy, spring-animated active indicator.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/bounce-sidebar.tsx`,
    dependencies: [{ name: "motion", icon: createElement(MotionIcon, { className: "h-4 w-4" }) }],
    interaction: "Click any item to spring the bouncing marker over to it.",
    props: [
      {
        name: "items",
        type: "string[]",
        required: true,
        description: "Labels rendered as the vertical list of nav items.",
      },
      {
        name: "value",
        type: "number",
        description:
          "Active item index for controlled usage. When set, the component won't manage its own state.",
      },
      {
        name: "defaultValue",
        type: "number",
        default: "0",
        description:
          "Initial active index for uncontrolled usage. Ignored when value is provided.",
      },
      {
        name: "onChange",
        type: "(index: number) => void",
        description: "Called with the new index whenever an item is selected.",
      },
      {
        name: "dotColor",
        type: "string",
        default: '"#FC4C01"',
        description:
          "Any CSS color for the bouncing active marker (hex, rgb, hsl, var).",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the root <ul> element.",
      },
    ],
    usage: `import { BounceSidebar } from "@/components/ui/bounce-sidebar"
  
  const items = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ]
  
  export function Demo() {
    return <BounceSidebar items={items} dotColor="#FC4C01" />
  }`,
  },
  {
    name: "Proximity Sidebar",
    href: "/components/proximitysidebar",
    registry: "proximity-sidebar",
    description:
      "An interactive sidebar with proximity hover effects that appears while scrolling and responds to scroll intensity.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/proximity-sidebar.tsx`,
    dependencies: [{ name: "motion", icon: createElement(MotionIcon, { className: "h-4 w-4" }) }],
    interaction:
      "Scroll through content to track the current section, then move the pointer near dashes to expand them and click to smooth-scroll to a section.",
    props: [
      {
        name: "sections",
        type: "Array<{ id: string; label: string; kind?: \"title\" | \"subtitle\" | \"section\" | \"body\"; level?: 1 | 2 | 3 | 4 | 5 | 6 }>",
        required: true,
        description:
          "Ordered section map used for rendering dashes and scroll targeting. Each id must match an element id present in the page.",
      },
      {
        name: "side",
        type: '"left" | "right"',
        default: '"left"',
        options: ["left", "right"],
        description:
          "Pins the minimap to the chosen side and flips dash transform origin accordingly.",
      },
      {
        name: "activeOffset",
        type: "number",
        default: "0.4",
        description:
          "Viewport anchor ratio used to detect the active section while scrolling (0 = top, 1 = bottom).",
      },
      {
        name: "className",
        type: "string",
        description: "Additional classes for the outer nav wrapper.",
      },
    ],
    usage: `import ProximitySidebar, { type ProximitySection } from "@/components/ui/proximity-sidebar"

const sections = [
  { id: "intro", label: "Introduction", level: 1 },
  { id: "setup", label: "Setup", level: 2 },
  { id: "api", label: "API", kind: "section" },
  { id: "faq", label: "FAQ", kind: "body" },
] satisfies ProximitySection[]

export function Demo() {
  return (
    <aside className="sticky top-20 h-[70vh]">
      <ProximitySidebar
        sections={sections}
        side="left"
        activeOffset={0.4}
      />
    </aside>
  )
}`,
    credits: [
      "Inspired by devouringdetails.com",
    ],
  },
  {
    name: "Duration Picker",
    href: "/components/durationpicker",
    registry: "duration-picker",
    description:
      "A gooey, spring-animated picker for entering a duration in hours and minutes.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/duration-picker.tsx`,
    dependencies: [
      { name: "motion", icon: createElement(MotionIcon, { className: "h-4 w-4" }) },
      { name: "figma-squircle" },
      { name: "flubber" },
      { name: "react-use-measure" },
      { name: "@radix-ui/react-slot" },
    ],
    interaction:
      "Click the pen to spring the segments apart and start editing — the hours field is focused for you. Type your values; anything past the ceiling (24 hr / 60 min by default) clamps to the max and shakes so you know it was corrected. Click the tick to confirm and watch the pill merge back into one piece.",
    props: [
      {
        name: "value",
        type: "{ hours: number; minutes: number }",
        description:
          "Controlled value. Pair with onChange and the picker will mirror whatever you pass in. Leave it out to let the component manage its own state.",
      },
      {
        name: "defaultValue",
        type: "{ hours: number; minutes: number }",
        default: "{ hours: 0, minutes: 0 }",
        description:
          "Starting value for uncontrolled usage. Ignored when value is provided.",
      },
      {
        name: "onChange",
        type: "(value: DurationValue) => void",
        description:
          "Fires on every keystroke with the current clamped value — listen here if you want to react while the user types.",
      },
      {
        name: "onConfirm",
        type: "(value: DurationValue) => void",
        description:
          "Fires once with the final value when the tick is clicked. This is usually the one you want for saving.",
      },
      {
        name: "onEditingChange",
        type: "(editing: boolean) => void",
        description:
          "Notifies you when the picker enters or leaves edit mode — handy for blocking navigation or dimming surrounding UI while open.",
      },
      {
        name: "defaultEditing",
        type: "boolean",
        default: "false",
        description: "Render the picker already open in edit mode.",
      },
      {
        name: "maxHours",
        type: "number",
        default: "24",
        description:
          "Ceiling for the hours field. Typing past it clamps to this value and shakes the input.",
      },
      {
        name: "maxMinutes",
        type: "number",
        default: "60",
        description:
          "Ceiling for the minutes field. Same clamp-and-shake behavior as maxHours.",
      },
      {
        name: "hoursLabel",
        type: "string",
        default: '"Hr."',
        description:
          "Text rendered after the hours field — swap it for a translation or a terser 'h'.",
      },
      {
        name: "minutesLabel",
        type: "string",
        default: '"Min."',
        description: "Text rendered after the minutes field.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description:
          "Dims the control and blocks entering edit mode. Standard form-field behavior.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra classes merged onto the root. Every inner part also carries a data-slot attribute (duration-picker, -segment, -input, -toggle) plus data-editing / data-disabled states, so you can restyle from CSS alone.",
      },
    ],
    usage: `"use client"

import DurationPicker, { type DurationValue } from "@/components/ui/duration-picker"
import { useState } from "react"

export function Demo() {
  const [duration, setDuration] = useState<DurationValue>({ hours: 1, minutes: 30 })

  return (
    <DurationPicker
      value={duration}
      onChange={setDuration}                     // fires while typing
      onConfirm={(d) => console.log("saved", d)} // fires when the tick is clicked
    />
  )
}

// Zero-config: it also works fully uncontrolled
// <DurationPicker onConfirm={(d) => console.log("saved", d)} />`,
  },
  {
    name: "Fluid Orb",
    href: "/components/fluidorb",
    registry: "fluid-orb",
    description:
      "An animated WebGL orb with drifting fluid shading, inspired by ChatGPT's voice mode.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/fluid-orb.tsx`,
    interaction:
      "Ambient — the color patches drift left, right, up, down and diagonally on their own, blending and reforming with no interaction required. Honors prefers-reduced-motion by holding a still frame.",
    props: [
      {
        name: "color",
        type: "string",
        default: '"#1A73F2"',
        options: ["#1A73F2", "#FF3B30", "#F75001", "#34C759"],
        control: "swatch",
        optionColors: {
          "#1A73F2": "#1A73F2",
          "#FF3B30": "#FF3B30",
          "#F75001": "#F75001",
          "#34C759": "#34C759",
        },
        description:
          "Any hex color for the fluid. The middle and bottom bands are derived from it (a pale tint and the full color), while the top stays white. Defaults to the original blue.",
      },
      {
        name: "size",
        type: "number",
        default: "240",
        description:
          "Diameter of the orb in pixels. Also drives the canvas resolution (clamped to 2x device pixel ratio).",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra classes merged onto the root element (data-slot=\"fluid-orb\").",
      },
    ],
    usage: `import FluidOrb from "@/components/ui/fluid-orb"

export function Demo() {
  return <FluidOrb size={280} color="#F75001" />
}`,
    credits: [
      "Inspired by chatgpt.com",
    ],
  },
  {
    name: "Scroll Progress",
    href: "/components/scrollprogressindicator",
    registry: "scroll-progress",
    description:
      "A scroll progress pill that tracks reading position and expands into a squircle menu of sections you can jump to.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/scroll-progress.tsx`,
    dependencies: [
      { name: "motion", icon: createElement(MotionIcon, { className: "h-4 w-4" }) },
    ],
    interaction:
      "Scroll to fill the ring and watch the active section label crossfade in. Click the pill to morph it into a squircle menu, then tap any section to smooth-scroll there. Click outside or press Escape to close.",
    props: [
      {
        name: "sections",
        type: "Array<{ id: string; label: string }>",
        default: "[]",
        description:
          "Ordered sections shown as the reader moves and listed in the menu. Each id must match an element id present in the scrolled content.",
      },
      {
        name: "containerRef",
        type: "React.RefObject<HTMLElement | null>",
        description:
          "Scroll container to track and scroll within. Defaults to the window when omitted.",
      },
      {
        name: "offset",
        type: "number",
        default: "120",
        description:
          "Distance in pixels below the scroller's top edge that a section must cross to be marked active.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra classes merged onto the fixed root wrapper — use it to reposition the pill.",
      },
    ],
    usage: `"use client"

import { useRef } from "react"
import ScrollProgress from "@/components/ui/scroll-progress"

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "usage", label: "Usage" },
  { id: "faq", label: "FAQ" },
]

export function Demo() {
  const scrollRef = useRef<HTMLElement>(null)

  return (
    <main ref={scrollRef} className="relative h-full overflow-auto">
      <ScrollProgress containerRef={scrollRef} sections={sections} />

      <section id="intro">{/* ... */}</section>
      <section id="usage">{/* ... */}</section>
      <section id="faq">{/* ... */}</section>
    </main>
  )
}

// Tracks the window with no container ref:
// <ScrollProgress sections={sections} />`,
  },
  {
    name: "Gravity Letters",
    href: "/components/gravityletters",
    registry: "gravity-letters",
    description:
      "A click-to-drop field where each click releases a random glyph — a letter, a number, an emoji, or any component you pass — that falls, lands with a squash, and piles up into rolling hills.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/gravity-letters.tsx`,
    interaction:
      "Click or tap anywhere to drop a random glyph from that point. It falls with gravity, glides off steep spots toward lower ground, and lands with a soft squash — so repeated clicks grow rounded hills instead of towers. Pass items to drop your own content (emoji, icons, any React node); each glyph is measured from its real rendered size, so the pile stays physically correct. Set maxGlyphs to recycle old glyphs; when they fade out, anything left floating falls back down. Honors prefers-reduced-motion by placing glyphs directly on the pile.",
    props: [
      {
        name: "type",
        type: '"letters" | "numbers" | "both"',
        default: '"letters"',
        options: ["letters", "numbers", "both"],
        description:
          "What falls on click — a random letter, a random digit, or a random pick from both pools. Ignored when items is set.",
      },
      {
        name: "items",
        type: "React.ReactNode[]",
        description:
          "Custom drop pool — each click picks a random entry. Takes anything renderable: emoji strings, icons, or full components. Overrides type. Size custom nodes in em units to follow the size randomization, or leave them fixed — physics measures their real rendered box either way.",
      },
      {
        name: "gravity",
        type: "number",
        default: "800",
        description:
          "Downward acceleration in px/s². Lower it for a floaty, moon-like fall; raise it for a heavy thud.",
      },
      {
        name: "size",
        type: "number",
        default: "28",
        description:
          "Base font size in pixels. Each glyph randomizes around it (0.7×–1.3×) so the pile looks organic.",
      },
      {
        name: "color",
        type: "string",
        default: '"currentColor"',
        options: ["#1A73F2", "#FF3B30", "#F75001", "#34C759"],
        control: "swatch",
        optionColors: {
          "#1A73F2": "#1A73F2",
          "#FF3B30": "#FF3B30",
          "#F75001": "#F75001",
          "#34C759": "#34C759",
        },
        description:
          "Any CSS color for the glyphs. Defaults to currentColor so they inherit the surrounding text color and follow your theme.",
      },
      {
        name: "maxGlyphs",
        type: "number",
        default: "Infinity",
        description:
          "Optional cap on glyphs kept in the field. Unlimited by default — pass a number and once it's exceeded the oldest glyphs fade out, one per new drop.",
      },
      {
        name: "className",
        type: "string",
        description:
          'Extra classes merged onto the root element (data-slot="gravity-letters") — use it to size the field.',
      },
    ],
    usage: `import GravityLetters from "@/components/ui/gravity-letters"

export function Demo() {
  return (
    <GravityLetters type="letters" className="h-96 w-full rounded-3xl border">
      {/* anything you render inside stays clickable-through */}
      <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
        Click anywhere
      </p>
    </GravityLetters>
  )
}

// Digits instead:
// <GravityLetters type="numbers" />

// Or drop your own content — emoji, icons, any component:
// <GravityLetters items={["🍎", "🍊", "🍇", <Sparkles key="s" className="size-7" />]} />`,
  },
  {
    name: "Code Block",
    href: "/components/codeblock",
    registry: "code-block",
    description:
      "A clean code block that builds its entire theme from a single accent color. Pass code and a hex, it does the rest.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/code-block.tsx`,
    dependencies: [
      { name: "motion", icon: createElement(MotionIcon, { className: "h-4 w-4" }) },
      { name: "prism-react-renderer" },
    ],
    interaction:
      "Pick an accent swatch to re-shade the whole block from that color. Hit the copy button to see it spring into a check.",
    props: [
      {
        name: "code",
        type: "string",
        required: true,
        description: "The source code to render.",
      },
      {
        name: "language",
        type: "string",
        default: '"tsx"',
        description:
          'Prism language id, e.g. "tsx", "css", "json", "bash". Also shown as the tag in the header.',
      },
      {
        name: "accent",
        type: "string",
        default: '"#F75001"',
        options: ["#F75001", "#1A73F2", "#FF3B30", "#34C759"],
        control: "swatch",
        optionColors: {
          "#F75001": "#F75001",
          "#1A73F2": "#1A73F2",
          "#FF3B30": "#FF3B30",
          "#34C759": "#34C759",
        },
        description:
          "Any hex color. The whole theme is shades of it: the darkest shade is the background, tokens are tints of the accent, and the lightest text is always white.",
      },
      {
        name: "mode",
        type: '"auto" | "dark" | "light"',
        default: '"auto"',
        description:
          "Color scheme. Auto follows the page theme (html dark/light class, data-theme, or OS preference). Pass dark or light to pin a palette: dark puts light tints of the accent on a dark surface, light flips the ramp.",
      },
      {
        name: "filename",
        type: "string",
        description:
          "Filename or path shown on the left of the header. Falls back to the language id when omitted.",
      },
      {
        name: "showFrame",
        type: "boolean",
        default: "true",
        description:
          "Toggles the outer layout — background, border, rounded corners, and header. Turn off to render nothing but the highlighted code.",
      },
      {
        name: "showHeader",
        type: "boolean",
        default: "true",
        description:
          "Toggles the header bar. When hidden, the copy button floats over the top-right corner instead. Ignored when showFrame is off.",
      },
      {
        name: "showLineNumbers",
        type: "boolean",
        default: "true",
        description: "Toggles the line-number gutter.",
      },
      {
        name: "showCopyButton",
        type: "boolean",
        default: "true",
        description: "Toggles the copy-to-clipboard button.",
      },
      {
        name: "highlightLines",
        type: "number[]",
        description:
          "Optional 1-based line numbers to highlight with a soft accent wash. Off when omitted.",
      },
      {
        name: "className",
        type: "string",
        description:
          'Extra classes merged onto the root element (data-slot="code-block") — use it for width and max-height.',
      },
    ],
    usage: `import CodeBlock from "@/components/ui/code-block"

export function Demo() {
  return (
    <CodeBlock
      code={\`const greet = (name: string) => \\\`Hello, \\\${name}!\\\`\`}
      language="ts"
      accent="#F75001"
      filename="greet.ts"
    />
  )
}`,
  }
  // {
  //   name: "Family drawer",
  //   href: "/components/familydrawer",
  //   registry: "family drawer",
  //   description:
  //     "A bottom drawer with smooth, morphing transitions between stacked views, inspired by the Family app. Built on Vaul.",
  //   source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/family-drawer.tsx`,
  //   dependencies: [{ name: "motion" }, { name: "vaul" }],
  //   interaction: "Click the trigger to open the drawer and step between views.",
  //   usage: `import FamilyDrawer from "@/components/ui/family-drawer"

  // export function Demo() {
  //   return <FamilyDrawer />
  // }`,
  // },
];

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const PM_EXECUTORS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

export const PACKAGE_MANAGERS = Object.keys(PM_EXECUTORS) as PackageManager[];

export function installCommand(
  item: ComponentItem,
  pm: PackageManager = "npm",
): string | null {
  if (!item.registry) return null;
  return `${PM_EXECUTORS[pm]} shadcn add ${REGISTRY_REPO}/${item.registry}`;
}

export function activeComponent(pathname: string): ComponentItem | undefined {
  return components.find((c) => c.href === pathname);
}

export function swatchProp(item?: ComponentItem): ComponentProp | undefined {
  return item?.props?.find((p) => p.control === "swatch" && p.optionColors);
}

export function cleanDefault(prop?: ComponentProp): string | undefined {
  return prop?.default?.replace(/^["']|["']$/g, "");
}
