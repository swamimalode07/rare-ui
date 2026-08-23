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

export type ComponentCategory =
  | "ai"
  | "navigation"
  | "inputs"
  | "feedback"
  | "display";

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  ai: "AI kit",
  navigation: "Navigation",
  inputs: "Inputs",
  feedback: "Feedback",
  display: "Display",
};

export const CATEGORY_ORDER: ComponentCategory[] = [
  "ai",
  "navigation",
  "inputs",
  "feedback",
  "display",
];

export type ComponentItem = {
  name: string;
  href: string;
  categories: ComponentCategory[];
  isNew?: boolean;
  description?: string;
  registry?: string;
  source?: string;
  preview?: string;
  featured?: boolean;
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
    categories: ["display"],
    registry: "folder-component",
    description:
      "An animated folder whose cards fan out on hover and lift open on click, with a 3D-tilted flap. Supports color and size (sm/md/lg) props.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/folder-component.tsx`,
    preview: "/componentdemos/foldercomponent.mp4",
    featured: true,
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
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
    categories: ["navigation"],
    registry: "bounce-sidebar",
    description:
      "A vertical navigation list with a bouncy, spring-animated active indicator.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/bounce-sidebar.tsx`,
    preview: "/componentdemos/bouncesidebar.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
    ],
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
    categories: ["navigation"],
    registry: "proximity-sidebar",
    description:
      "An interactive sidebar with proximity hover effects that appears while scrolling and responds to scroll intensity.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/proximity-sidebar.tsx`,
    preview: "/componentdemos/proximitysidebar.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
    ],
    interaction:
      "Scroll through content to track the current section, then move the pointer near dashes to expand them and click to smooth-scroll to a section.",
    props: [
      {
        name: "sections",
        type: 'Array<{ id: string; label: string; kind?: "title" | "subtitle" | "section" | "body"; level?: 1 | 2 | 3 | 4 | 5 | 6 }>',
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
    credits: ["Inspired by devouringdetails.com"],
  },
  {
    name: "Duration Picker",
    href: "/components/durationpicker",
    categories: ["inputs"],
    registry: "duration-picker",
    description:
      "A gooey, spring-animated picker for entering a duration in hours and minutes.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/duration-picker.tsx`,
    preview: "/componentdemos/durationpicker.mp4",
    featured: true,
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
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
    categories: ["ai"],
    registry: "fluid-orb",
    description:
      "An animated WebGL orb with drifting fluid shading, inspired by ChatGPT's voice mode.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/fluid-orb.tsx`,
    preview: "/componentdemos/fluidorb.mp4",
    featured: true,
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
          'Extra classes merged onto the root element (data-slot="fluid-orb").',
      },
    ],
    usage: `import FluidOrb from "@/components/ui/fluid-orb"

export function Demo() {
  return <FluidOrb size={280} color="#F75001" />
}`,
    credits: ["Inspired by chatgpt.com"],
  },
  {
    name: "Scroll Progress",
    href: "/components/scrollprogressindicator",
    categories: ["navigation"],
    registry: "scroll-progress",
    description:
      "A scroll progress pill that tracks reading position and expands into a squircle menu of sections you can jump to.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/scroll-progress.tsx`,
    preview: "/componentdemos/scrollprogress.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
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
    name: "Code Block",
    href: "/components/codeblock",
    categories: ["display"],
    registry: "code-block",
    description:
      "A clean code block that builds its entire theme from a single accent color. Pass code and a hex, it does the rest.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/code-block.tsx`,
    preview: "/componentdemos/codeblock.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
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
  },
  {
    name: "Gravity Letters",
    href: "/components/gravityletters",
    categories: ["display"],
    registry: "gravity-letters",
    description:
      "A playful gravity field where letters, numbers, emoji, or any components you pass fall and pile up like real objects.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/gravity-letters.tsx`,
    preview: "/componentdemos/gravityletters.mp4",
    featured: true,
    interaction:
      "Click or tap anywhere to drop a glyph, or press and hold to pour a steady stream. Glyphs tumble as they fall, bounce softly when they land, and pile up into rounded hills. On phones, tilt the device to spill the pile toward the low side. Honors prefers-reduced-motion.",
    props: [
      {
        name: "type",
        type: '"letters" | "numbers" | "both"',
        default: '"letters"',
        options: ["letters", "numbers", "both"],
        description:
          "Which pool to draw from: letters, digits, or both. Ignored when items is set.",
      },
      {
        name: "items",
        type: "React.ReactNode[]",
        description:
          "Your own drop pool: emoji, icons, or any components. Each drop picks a random entry. Overrides type.",
      },
      {
        name: "gravity",
        type: "number",
        default: "800",
        description:
          "Downward acceleration in px/s². Lower is floatier, higher is heavier.",
      },
      {
        name: "size",
        type: "number",
        default: "28",
        description:
          "Base glyph size in pixels. Each drop varies slightly around it.",
      },
      {
        name: "color",
        type: "string",
        default: '"currentColor"',
        options: [
          "#1A73F2",
          "#AF52DE",
          "#FF3B30",
          "#F75001",
          "#34C759",
        ],
        control: "swatch",
        optionColors: {
          "#1A73F2": "#1A73F2",
          "#AF52DE": "#AF52DE",
          "#FF3B30": "#FF3B30",
          "#F75001": "#F75001",
          "#34C759": "#34C759",
        },
        description:
          "Glyph color. Defaults to currentColor so it follows your theme.",
      },
      {
        name: "maxGlyphs",
        type: "number",
        default: "Infinity",
        description:
          "Max glyphs kept in the field; past the cap the oldest fade out. Unlimited by default.",
      },
      {
        name: "deviceTilt",
        type: "boolean",
        default: "true",
        description:
          "Tilting a phone spills the pile toward the low side. iOS asks for motion permission on the first tap.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra classes for the root element. Use it to size the field.",
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

// Or drop your own content: emoji, icons, any component:
// <GravityLetters items={["🍎", "🍊", "🍇", <Sparkles key="s" className="size-7" />]} />`,
  },
  {
    name: "OTP Input",
    href: "/components/otpinput",
    categories: ["inputs"],
    registry: "otp-input",
    description:
      "A one-time-code input whose characters roll into place behind a caret that slides from slot to slot.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/otp-input.tsx`,
    preview: "/componentdemos/otpinput.mp4",
    featured: true,
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
    ],
    interaction:
      "Type to fill each slot and move to the next one. Backspace clears a slot in place, then steps back on the next press. Arrow keys move between slots, and a caret slides along with you. Pasting a code, or letting the phone autofill one from a text message, drops it straight in. Set the status to turn the slots green, or shake them red on a wrong code.",
    props: [
      {
        name: "length",
        type: "number",
        default: "6",
        description:
          "How many boxes to render, so a 4 digit code is length={4}. Any count works.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        options: ["sm", "md", "lg"],
        description:
          "Overall scale of the boxes. Maps to 40px (sm), 48px (md), and 56px (lg), and carries the text, caret, and gaps with it.",
      },
      {
        name: "value",
        type: "string",
        description:
          "The current code. Pass it to control the input yourself; leave it out to let the component track its own state.",
      },
      {
        name: "defaultValue",
        type: "string",
        default: '""',
        description: "Starting code when the input is uncontrolled.",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        description: "Fires on every edit with the full code so far.",
      },
      {
        name: "onComplete",
        type: "(value: string) => void",
        description: "Fires once the last slot is filled.",
      },
      {
        name: "type",
        type: '"numbers" | "letters" | "both"',
        default: '"numbers"',
        options: ["numbers", "letters", "both"],
        description:
          "Which characters a slot accepts. Anything else is ignored, including on paste.",
      },
      {
        name: "status",
        type: '"idle" | "success" | "error"',
        default: '"idle"',
        options: ["idle", "success", "error"],
        description:
          "Drives the feedback state. Success traces a green ring around each box in turn, error rings them red and shakes the row once.",
      },
      {
        name: "mask",
        type: "boolean",
        default: "false",
        description: "Hides the characters, like a password field.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Blocks input and dims every slot.",
      },
      {
        name: "autoFocus",
        type: "boolean",
        default: "false",
        description: "Focuses the first slot on mount.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes for the row that wraps the slots.",
      },
      {
        name: "slotClassName",
        type: "string",
        description: "Extra classes for each slot, for sizing and colors.",
      },
    ],
    usage: `import { useState } from "react"
import OtpInput, { type OtpStatus } from "@/components/ui/otp-input"

export function Demo() {
  const [status, setStatus] = useState<OtpStatus>("idle")

  return (
    <OtpInput
      length={6}
      size="md"
      status={status}
      onChange={() => setStatus("idle")}
      onComplete={(code) => setStatus(checkCode(code) ? "success" : "error")}
    />
  )
}`,
  },
  {
    name: "GitHub activity",
    href: "/components/githubactivity",
    categories: ["display"],
    registry: "github-activity",
    description:
      "A contribution heatmap with a footer panel that expands over the grid to rank your top repositories.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/github-activity.tsx`,
    preview: "/componentdemos/githubgraphcomponentblack.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
    ],
    interaction:
      "Click the chevron to expand the top repositories over the grid, and again to collapse them back into the stack. Hover any cell for its count and date.",
    props: [
      {
        name: "username",
        type: "string",
        description: "The GitHub username you want the data for.",
      },
      {
        name: "contributions",
        type: "Contribution[]",
        default: "[]",
        description: "Your own contribution data, instead of a username.",
      },
      {
        name: "repos",
        type: "RepoContribution[]",
        default: "[]",
        description: "The repositories listed in the footer, highest first.",
      },
      {
        name: "year",
        type: "number",
        description:
          "Year shown in the heading. Defaults to the year of the last contribution.",
      },
      {
        name: "accent",
        type: "string | string[]",
        default: '"#39d353"',
        description: "The color of the contribution squares.",
      },
      {
        name: "cellSize",
        type: "number",
        default: "11",
        description: "Size of each day square in pixels.",
      },
      {
        name: "months",
        type: "number",
        default: "12",
        description: "How many months of history to show.",
      },
      {
        name: "showMonths",
        type: "boolean",
        default: "false",
        description: "Adds a row of month names above the grid.",
      },
      {
        name: "label",
        type: "string",
        default: '"Top contributions in:"',
        description: "Text shown in the footer next to the avatars.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        default: "false",
        description:
          "Starts with the repository panel open. Ignored when open is set.",
      },
      {
        name: "open",
        type: "boolean",
        description:
          "Panel state for controlled usage. When set, the component stops managing its own state.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called with the next state when the chevron is clicked.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes for the card that wraps the grid.",
      },
    ],
    usage: `import GitHubActivity from "@/components/ui/github-activity"

export function Demo() {
  return <GitHubActivity username="swamimalode07" />
}

// or pass everything yourself
<GitHubActivity
  contributions={contributions}
  repos={[{ name: "Zero mail", count: 412, logo: <ZeroIcon /> }]}
  accent={["#0e4429", "#006d32", "#26a641", "#39d353"]}
/>`,
  },
  {
    name: "Emoji reaction",
    href: "/components/emojireaction",
    categories: ["feedback"],
    registry: "emoji-reaction",
    description:
      "A tapback-style reaction button that opens a bar of Apple emoji and sends copies of your pick floating up out of it.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/emoji-reaction.tsx`,
    preview: "/componentdemos/emojireaction.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
      { name: "react-apple-emojis" },
      { name: "lucide-react" },
      { name: "@radix-ui/react-slot" },
    ],
    interaction:
      "Click the button to pop the emoji bar open, or press and drag straight onto an emoji to pick it in one gesture. Hover an emoji to lift it. Pick one and 5 copies stream up off it, drifting apart, shrinking, and blurring out of focus as they climb. Hold the emoji down to keep them coming. The bar flips below the button when there's no room above, and arrow keys move along it. While it's open the button turns into a cross; click that, click outside, or press Escape to close. The button then shows your last pick.",
    props: [
      {
        name: "emojis",
        type: "string[]",
        default: "5 default faces",
        description:
          "Apple emoji names shown in the bar, hyphenated as on Emojipedia. Anything beyond the five defaults needs emojiData too.",
      },
      {
        name: "emojiData",
        type: "EmojiData",
        description:
          "Emoji name to image map passed to EmojiProvider. Defaults to the five bundled faces; pass react-apple-emojis/src/data.json for the full set.",
      },
      {
        name: "onReact",
        type: "(name: string) => void",
        description:
          "Called with the emoji name every time one is picked, including each repeat while it's held down.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        options: ["sm", "md", "lg"],
        description: "Scale of the button, the bar, and the emoji that fly up.",
      },
      {
        name: "align",
        type: '"left" | "center" | "right"',
        default: '"center"',
        options: ["left", "center", "right"],
        description:
          "Which edge of the bar lines up with the trigger. It still shifts inward when it would run off screen.",
      },
      {
        name: "asChild",
        type: "boolean",
        default: "false",
        description:
          "Uses your own child as the trigger instead of the built-in button, so the bar can hang off a message, card, or image.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the root element.",
      },
    ],
    usage: `import { EmojiReaction } from "@/components/ui/emoji-reaction"

export function Demo() {
  return <EmojiReaction onReact={(name) => console.log(name)} />
}

// or hang the bar off your own element
<EmojiReaction asChild>
  <button className="rounded-2xl bg-card p-4">Nice work</button>
</EmojiReaction>`,
  },
  {
    name: "Notification bell",
    href: "/components/notificationbell",
    categories: ["feedback"],
    isNew: true,
    registry: "notification-bell",
    description: "An iOS-style notification bell with an unread count badge.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/notification-bell.tsx`,
    preview: "/componentdemos/notification.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
      { name: "@radix-ui/react-slot" },
    ],
    interaction:
      "Press plus to add a notification, minus to clear one. The bell swings when one lands and the count rolls to the new number. Add a few fast and it swings harder. The badge shrinks away at zero.",
    props: [
      {
        name: "count",
        type: "number",
        default: "0",
        description:
          "Unread total on the badge. The badge is hidden at 0, and fractional or negative values are floored to it.",
      },
      {
        name: "max",
        type: "number",
        default: "99",
        description:
          "Highest number shown. Anything above it displays as the max followed by a plus.",
      },
      {
        name: "variant",
        type: '"count" | "dot"',
        default: '"count"',
        options: ["count", "dot"],
        description:
          "Whether the badge shows the number or a plain dot. The dot appears and leaves on the same counts.",
      },
      {
        name: "size",
        type: "number",
        default: "48",
        description:
          "Diameter of the button in pixels. The bell, badge, and digits are all fractions of it.",
      },
      {
        name: "color",
        type: '"red" | "orange" | "green" | "blue" | "violet"',
        default: '"red"',
        options: ["red", "orange", "green", "blue", "violet"],
        control: "swatch",
        optionColors: {
          red: "#FF3B30",
          orange: "#FF9500",
          green: "#34C759",
          blue: "#007AFF",
          violet: "#AF52DE",
        },
        description:
          "Badge color, from the Apple system palette. Each one swaps to its dark mode variant with the theme.",
      },
      {
        name: "asChild",
        type: "boolean",
        default: "false",
        description:
          "Uses your own child as the trigger instead of the built-in button, so the badge can sit on an avatar or a nav item. Your element should be round for the badge to line up, and the bell swing only runs on the built-in button.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra classes merged onto the root element. Sizing is set inline from the size prop, so a width or height class here will not take effect.",
      },
    ],
    usage: `import { NotificationBell } from "@/components/ui/notification-bell"

export function Demo() {
  return <NotificationBell count={8} />
}

// or wrap it in your own menu trigger
<DropdownMenuTrigger asChild>
  <NotificationBell count={8} />
</DropdownMenuTrigger>`,
  },
  {
    name: "Step player",
    href: "/components/stepplayer",
    categories: ["display"],
    isNew: true,
    registry: "step-player",
    description:
      "An iOS-style stepped progress track with a play, pause and replay control. The active step stretches into a bar that fills as it plays.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/step-player.tsx`,
    preview: "/componentdemos/stepplayer.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
      { name: "flubber" },
    ],
    interaction:
      "Press play to start the sequence. The current step stretches into a bar and fills as it runs, then shrinks to a filled dot when it hands off to the next one. Press again to pause mid-fill; the play icon splits into the pause bars as it goes. At the end it fades into a replay arrow. Steps can be clicked to jump.",
    props: [
      {
        name: "steps",
        type: "number | StepPlayerStep[]",
        default: "4",
        description:
          "How many steps to show. Pass an array to give each one its own duration or label.",
      },
      {
        name: "value",
        type: "number",
        description:
          "Active step index, for controlled use. Leave it out and the component tracks its own index.",
      },
      {
        name: "defaultValue",
        type: "number",
        default: "0",
        description:
          "Step to start on when uncontrolled. Clamped to the last step.",
      },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        description:
          "Fires when the step advances, wraps, or is clicked. Also fires on replay.",
      },
      {
        name: "playing",
        type: "boolean",
        description:
          "Play state, for controlled use. Leave it out to let the button drive it.",
      },
      {
        name: "defaultPlaying",
        type: "boolean",
        default: "false",
        description:
          "Whether the sequence starts running on mount when uncontrolled.",
      },
      {
        name: "onPlayingChange",
        type: "(playing: boolean) => void",
        description:
          "Fires when the button is pressed, and when the last step ends without loop.",
      },
      {
        name: "duration",
        type: "number",
        default: "4000",
        description:
          "Milliseconds each step runs for. A per-step duration overrides it; 0 stops the timer so you can drive the index yourself.",
      },
      {
        name: "loop",
        type: "boolean",
        default: "false",
        description:
          "Wraps back to the first step instead of stopping. The replay button never appears when this is on.",
      },
      {
        name: "onComplete",
        type: "() => void",
        description:
          "Fires when the last step finishes, on every pass when looping.",
      },
      {
        name: "size",
        type: "number",
        default: "48",
        description:
          "Height of the track and button in pixels. Every other dimension is a fixed ratio of it, so the dots, bar, gaps, padding, icon, and tap targets all scale from this one number.",
      },
      {
        name: "showControl",
        type: "boolean",
        default: "true",
        description:
          "Shows the round play button. Turn it off for a track on its own and drive it with the playing prop.",
      },
      {
        name: "controlPosition",
        type: '"left" | "right"',
        default: '"right"',
        options: ["left", "right"],
        description: "Which side of the track the button sits on.",
      },
      {
        name: "seekable",
        type: "boolean",
        default: "false",
        description:
          "Lets a step be clicked to jump to it. The dots keep a finger-sized tap target at every size.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Extra classes merged onto the root element. It sizes itself from the size prop, so give it a width only if you want the track wider than its content.",
      },
    ],
    usage: `import { StepPlayer } from "@/components/ui/step-player"

export function Demo() {
  return <StepPlayer steps={5} duration={3000} />
}

// drive your own carousel off the index
<StepPlayer
  steps={slides.length}
  value={index}
  onValueChange={setIndex}
  loop
/>`,
  },
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
  {
    name: "Grid Reveal",
    href: "/components/gridreveal",
    categories: ["ai"],
    isNew: true,
    registry: "grid-reveal",
    description:
      "A loading state for AI images that turns into the real picture when it arrives.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/grid-reveal.tsx`,
    preview: "/componentdemos/imagegen.mp4",
    dependencies: [
      {
        name: "motion",
        icon: createElement(MotionIcon, { className: "h-4 w-4" }),
      },
    ],
    interaction:
      "Press Generate and the frame opens as four cells, then keeps splitting the biggest one in two until it becomes the picture. Busy parts of the image sharpen first, and a status pill sits in the bottom left until it lands. Honors prefers-reduced-motion by holding a still frame.",
    props: [
      {
        name: "src",
        type: "string | null",
        description:
          "Image to reveal. Keep it null while the image is generating, since the grid only runs while this is empty and a src that is already loaded makes the whole run flash by.",
      },
      {
        name: "alt",
        type: "string",
        description:
          "Describes the finished image for screen readers. The frame is hidden from assistive tech when omitted.",
      },
      {
        name: "progress",
        type: "number",
        description:
          "Position of the wait from 0 to 1, driving how far the grid has split. It holds at 0.72 until the image decodes, and the image landing is what finishes the reveal.",
      },
      {
        name: "aspect",
        type: "number",
        default: "1",
        description:
          "Width divided by height of the frame. The frame fills its parent's width, so constrain the parent to size it.",
      },
      {
        name: "caption",
        type: "string",
        description:
          "Optional status text, shown as a frosted pill in the bottom left of the frame and lit by a slow shimmer. Change it mid-run and the lines crossfade while the pill resizes to suit.",
      },
      {
        name: "estimatedDuration",
        type: "number",
        default: "6000",
        description:
          "Roughly how long the work takes, used to pace the grid when no progress is passed. Overrunning it is fine, the grid keeps creeping instead of stopping.",
      },
      {
        name: "onRevealComplete",
        type: "() => void",
        description: "Fires once the image has fully resolved.",
      },
      {
        name: "onError",
        type: "() => void",
        description:
          "Fires when the image fails to load. Without it a broken src leaves the grid waiting, so use it to show your own fallback.",
      },
      {
        name: "className",
        type: "string",
        description:
          'Extra classes merged onto the root element (data-slot="grid-reveal").',
      },
    ],
    usage: `"use client"

import { useState } from "react"
import GridReveal from "@/components/ui/grid-reveal"

export function Demo() {
  const [src, setSrc] = useState<string | null>(null)

  async function generate() {
    setSrc(null)                   // null is the waiting state, the grid runs while it is empty
    setSrc(await createImage())    // setting it resolves the grid into the picture
  }

  return (
    // the frame fills its parent, so give the parent a width
    <div className="w-64">
      <GridReveal src={src} alt="Generated image" caption="Creating image" />
      <button onClick={generate}>Generate</button>
    </div>
  )
}

// Passing a src that is already loaded skips the wait, so the run flashes by.
// Pass progress when your API reports it: <GridReveal src={src} progress={job.progress} />`,
  },
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
  // @latest matters: npx otherwise picks a stale local shadcn, and github registries need 4.16+
  return `${PM_EXECUTORS[pm]} shadcn@latest add ${REGISTRY_REPO}/${item.registry}`;
}

export type ComponentSection = {
  id: string;
  label: string;
  items: ComponentItem[];
};

// gallery sections: New repeats its members so they still appear under their own category
export const gallerySections: ComponentSection[] = [
  {
    id: "new",
    label: "New releases",
    items: components.filter((c) => c.isNew),
  },
  ...CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    items: components.filter((c) => c.categories.includes(id)),
  })),
].filter((section) => section.items.length > 0);

export function activeComponent(pathname: string): ComponentItem | undefined {
  return components.find((c) => c.href === pathname);
}

export function swatchProp(item?: ComponentItem): ComponentProp | undefined {
  return item?.props?.find((p) => p.control === "swatch" && p.optionColors);
}

export function cleanDefault(prop?: ComponentProp): string | undefined {
  return prop?.default?.replace(/^["']|["']$/g, "");
}
