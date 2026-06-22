export type Dependency = {
  name: string
  icon?: string
}

export type ComponentItem = {
  name: string
  href: string
  description?: string
  registry?: string
  source?: string
  dependencies?: Dependency[]
  interaction?: string
  usage?: string
}

export const REGISTRY_HOMEPAGE = "https://github.com/swamimalode07/rare-ui"
export const REGISTRY_REPO = "swamimalode07/rare-ui"

export const PANEL_INFO = {
  sourceHint: "Click the code icon in the top-right corner to view the source code.",
  keepInMind:
    "Most components here are recreations of great work from around the web. I don't claim to be the original creator — this is my attempt to reverse-engineer, replicate, and often add a few extra features. I've tried to credit everyone; if I missed someone, let me know.",
  contactEmail: "swamimalodeofficial@gmail.com",
  contactNote: "Found a bug or issue? Feel free to drop a DM.",
  license: [
    "Free to use and modify in both personal and commercial projects.",
    "Attribution to Rare UI is appreciated when using a component.",
    "Please don't resell the components as your own kit.",
  ],
} as const

export const components: ComponentItem[] = [
  {
    name: "Folder component",
    href: "/components/foldercomponent",
    registry: "folder-component",
    description:
      "An animated folder whose cards fan out on hover and lift open on click, with a 3D-tilted flap. Supports color and size (sm/md/lg) props.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/folder-component.tsx`,
    dependencies: [{ name: "motion" }],
    interaction: "Hover to fan the cards out, then click to lift the folder open.",
    usage: `import { Folder } from "@/components/ui/folder-component",

export function Demo() {
  return <Folder color="#f5b400" size="md" />
}`,
  },
  {
    name: "Bounce sidebar",
    href: "/components/bouncesidebar",
    registry: "bounce-sidebar",
    description:
      "A vertical nav whose active marker springs and bounces between items. Pass your own items and dot color; controlled or uncontrolled.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/bounce-sidebar.tsx`,
    dependencies: [{ name: "motion" }],
    interaction: "Click any item to spring the bouncing marker over to it.",
    usage: `import { BounceSidebar } from "@/components/ui/bounce-sidebar"

const items = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
]

export function Demo() {
  return <BounceSidebar items={items} dotColor="#22c55e" />
}`,
  },
  { name: "Button component", href: "/components/buttoncomponent" },
  { name: "Input component", href: "/components/inputcomponent" },
  { name: "Select component", href: "/components/selectcomponent" },
  { name: "Checkbox component", href: "/components/checkboxcomponent" },
  { name: "Radio component", href: "/components/radiocomponent" },
  { name: "Switch component", href: "/components/switchcomponent" },
  { name: "Textarea component", href: "/components/textareacomponent" },
  { name: "Tooltip component", href: "/components/tooltipcomponent" },
  { name: "Popover component", href: "/components/popovercomponent" },
  { name: "Menu component", href: "/components/menucomponent" },
  { name: "Dialog component", href: "/components/dialogcomponent" },
]

export function installCommand(item: ComponentItem): string | null {
  if (!item.registry) return null
  return `npx shadcn@latest add ${REGISTRY_REPO}/${item.registry}`
}

export function activeComponent(pathname: string): ComponentItem | undefined {
  return components.find((c) => c.href === pathname)
}
