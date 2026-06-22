# Contributing to Rare UI

Rare UI is a [shadcn registry](https://ui.shadcn.com/docs/registry). Every component in this repo can be installed into any project with a single command:

```bash
npx shadcn@latest add swamimalode07/rare-ui/<component-name>
```

This guide walks through adding a new component, from the first file to a working install command.

## Prerequisites

- Node.js 18+
- Run `npm install` once after cloning

Start the dev server to preview your work:

```bash
npm run dev
```

## Step 1: Create the component

Add your component to `components/ui/`. Use kebab-case for the file name — it should match the registry item name you'll register in Step 2.

```
components/ui/glow-badge.tsx
```

Conventions:

- Use the `cn()` helper from `@/lib/utils` for class merging.
- Style with Tailwind utilities and the theme tokens defined in `app/globals.css` (`bg-primary`, `text-muted-foreground`, `border`, etc.) so the component adapts to any consumer's theme. Avoid hard-coded colors where a token exists.
- Add `"use client"` at the top **only** if the component uses state, effects, event handlers, or browser APIs (see `spotlight-card.tsx` for an example). Leave it out otherwise (see `button.tsx`).
- Export named exports, not default exports:

```tsx
import { cn } from "@/lib/utils";

function GlowBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { GlowBadge };
```

## Step 2: Register it in registry.json

Add an entry to the `items` array in `registry.json` at the repo root. This is what makes the component installable.

```json
{
  "name": "glow-badge",
  "type": "registry:ui",
  "title": "Glow Badge",
  "description": "A badge with a soft glow.",
  "registryDependencies": ["swamimalode07/rare-ui/utils"],
  "files": [
    {
      "path": "components/ui/glow-badge.tsx",
      "type": "registry:ui"
    }
  ]
}
```

Field reference:

| Field                   | What it does                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                  | The install name: `npx shadcn add swamimalode07/rare-ui/glow-badge`                                                                                                                                          |
| `title` / `description` | Shown in `shadcn search` and `shadcn view`                                                                                                                                                                   |
| `dependencies`          | npm packages your component imports (e.g. `"framer-motion"`). The CLI installs them in the consumer's project automatically.                                                                                 |
| `registryDependencies`  | Other registry items your component imports, as full addresses. Almost always includes `swamimalode07/rare-ui/utils` (for `cn`). If your component renders our `Button`, add `swamimalode07/rare-ui/button`. |
| `files`                 | The files that ship with the item. Multi-file components (component + hook) just add more entries.                                                                                                           |
| `css`                   | Extra CSS to inject into the consumer's stylesheet — used for keyframes. See the `shimmer-button` item in `registry.json` for an example.                                                                    |

**Important:** if your component needs custom keyframes or CSS that isn't a Tailwind utility, you must do both:

1. Add it to `app/globals.css` (so it works in this repo's showcase), and
2. Add it to the item's `css` field (so it works in the consumer's project).

## Step 3: Add it to the showcase page

Add a section to `app/page.tsx` so the component is visible on the demo site:

```tsx
<ComponentSection name="Glow Badge" description="A badge with a soft glow.">
  <GlowBadge>New</GlowBadge>
</ComponentSection>
```

The install command shown under the section is derived from the `name` prop (lowercased, spaces → dashes), so make it match the registry item name.

## Step 4: Validate

```bash
npm run build
```

This runs `shadcn build` (validates `registry.json`, catches missing files and schema errors, and regenerates the hosted registry JSON in `public/r/`) followed by `next build` (type-checks the component itself). Both must pass. Commit the regenerated `public/r/` files together with your component.

Also check the component visually at `http://localhost:3000` in both light and dark mode (toggle your OS theme).

## Step 5: Push — that's the release

```bash
git add .
git commit -m "feat: add glow-badge"
git push
```

The GitHub repository **is** the registry — there is no separate publish step. As soon as the commit is on the default branch, the component is installable:

```bash
npx shadcn@latest add swamimalode07/rare-ui/glow-badge
```

## Step 6: Verify the install

Confirm the live registry resolves:

```bash
# validate the whole registry
npx shadcn@latest registry validate swamimalode07/rare-ui

# inspect the item payload the CLI will deliver
npx shadcn@latest view swamimalode07/rare-ui/glow-badge

# dry-run an install in any other project
npx shadcn@latest add swamimalode07/rare-ui/glow-badge --dry-run
```

## Checklist

- [ ] Component file in `components/ui/`, kebab-case, named exports, uses `cn()` and theme tokens
- [ ] `"use client"` only if it needs interactivity
- [ ] Item added to `registry.json` with correct `dependencies` / `registryDependencies`
- [ ] Custom CSS (if any) in both `app/globals.css` and the item's `css` field
- [ ] Showcase section added to `app/page.tsx`
- [ ] `npm run build` passes, regenerated `public/r/` committed
- [ ] Looks right in light and dark mode
