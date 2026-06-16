// Single source of truth for the sidebar and the description panel.
// To add a component: append an entry here, then create the matching folder at
// app/components/<slug>/page.tsx. Add `description` + `registry` once it ships.

export type ComponentItem = {
  name: string
  href: string
  /** Shown in the description panel. */
  description?: string
  /** Registry item name (registry.json), used to build the install command. */
  registry?: string
  /** Link to the component's source code (the "Get code" button). */
  source?: string
}

// Matches the `name` field of registry.json so install commands stay in sync.
export const REGISTRY_NAMESPACE = "rare-ui"
export const REGISTRY_HOMEPAGE = "https://github.com/swamimalode07/rare-ui"

export const components: ComponentItem[] = [
  {
    name: "Folder component",
    href: "/components/foldercomponent",
    registry: "folder-component",
    description:
      "An animated folder whose cards fan out on hover and lift open on click, with a 3D-tilted flap. Supports color and size (sm/md/lg) props.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/folder-component.tsx`,
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

/** The shadcn install command for a component, or null if it isn't published. */
export function installCommand(item: ComponentItem): string | null {
  if (!item.registry) return null
  return `npx shadcn@latest add @${REGISTRY_NAMESPACE}/${item.registry}`
}

/** The component whose page is currently active, matched by pathname. */
export function activeComponent(pathname: string): ComponentItem | undefined {
  return components.find((c) => c.href === pathname)
}
