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
      "A vertical nav whose active marker springs and bounces between items. Pass your own items and dot color; controlled or uncontrolled.",
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
      "A gooey, spring-driven duration picker. At rest it sits as one merged squircle pill; tap the pen and the hour and minute segments pull apart with a fluid stretch while the pen morphs into a tick. Confirm, and everything fuses back together with each field shrinking to hug its value.",
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
    usage: `import DurationPicker, { type DurationValue } from "@/components/ui/duration-picker"
import { useState } from "react"

export function Demo() {
  const [duration, setDuration] = useState<DurationValue>({ hours: 1, minutes: 30 })

  return (
    <DurationPicker
      value={duration}
      onChange={setDuration}          // fires while typing
      onConfirm={(d) => save(d)}      // fires when the tick is clicked
    />
  )
}

// Zero-config: it also works fully uncontrolled
// <DurationPicker onConfirm={(d) => save(d)} />`,
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

export function installCommand(item: ComponentItem): string | null {
  if (!item.registry) return null;
  return `npx shadcn@latest add ${REGISTRY_REPO}/${item.registry}`;
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
