export type Dependency = {
  name: string;
  icon?: string;
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
};

export const REGISTRY_HOMEPAGE = "https://github.com/swamimalode07/rare-ui";
export const REGISTRY_REPO = "swamimalode07/rare-ui";

export const PANEL_INFO = {
  sourceHint:
    "Click the code icon in the top-right corner to view the source code.",
  keepInMind:
    "Most components here are recreations of great work from around the web. I don't claim to be the original creator — this is my attempt to reverse-engineer, replicate, and often add a few extra features. I've tried to credit everyone; if I missed someone, let me know.",
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
    dependencies: [{ name: "motion" }],
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
  // Temporarily hidden for launch — keep only the Folder component visible.
  // {
  //   name: "Bounce sidebar",
  //   href: "/components/bouncesidebar",
  //   registry: "bounce-sidebar",
  //   description:
  //     "A vertical nav whose active marker springs and bounces between items. Pass your own items and dot color; controlled or uncontrolled.",
  //   source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/bounce-sidebar.tsx`,
  //   dependencies: [{ name: "motion" }],
  //   interaction: "Click any item to spring the bouncing marker over to it.",
  //   props: [
  //     {
  //       name: "items",
  //       type: "string[]",
  //       required: true,
  //       description: "Labels rendered as the vertical list of nav items.",
  //     },
  //     {
  //       name: "value",
  //       type: "number",
  //       description:
  //         "Active item index for controlled usage. When set, the component won't manage its own state.",
  //     },
  //     {
  //       name: "defaultValue",
  //       type: "number",
  //       default: "0",
  //       description:
  //         "Initial active index for uncontrolled usage. Ignored when value is provided.",
  //     },
  //     {
  //       name: "onChange",
  //       type: "(index: number) => void",
  //       description: "Called with the new index whenever an item is selected.",
  //     },
  //     {
  //       name: "dotColor",
  //       type: "string",
  //       default: '"#FC4C01"',
  //       description:
  //         "Any CSS color for the bouncing active marker (hex, rgb, hsl, var).",
  //     },
  //     {
  //       name: "className",
  //       type: "string",
  //       description: "Extra classes merged onto the root <ul> element.",
  //     },
  //   ],
  //   usage: `import { BounceSidebar } from "@/components/ui/bounce-sidebar"
  //
  // const items = [
  //   { label: "Home", href: "/" },
  //   { label: "About", href: "/about" },
  // ]
  //
  // export function Demo() {
  //   return <BounceSidebar items={items} dotColor="#22c55e" />
  // }`,
  // },
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
  //
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
