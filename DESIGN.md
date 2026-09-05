# Design

How Rare UI is put together: the stack, the file layout, the token system, and the rules a component follows before it ships.

For copy style and the docs workflow, see `CONVENTIONS.md`. For motion values, see `ANIMATION.md`.

## What this project is

Rare UI is a free, open-source registry of animated React components. It is not an installable npm package. Components are distributed as source through the shadcn CLI, so consumers copy the file into their own repo and own it from there.

The site at `rareui.com` is both the marketing page and the documentation for the registry.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.2.9, App Router, Turbopack |
| React | 19.2.4 |
| Styling | Tailwind CSS v4, CSS-first config via `@theme inline` |
| Motion | `motion` v12 (Motion for React) |
| Distribution | shadcn CLI v4, `registry.json` builds to `public/r/*.json` |
| Theming | `next-themes`, class strategy, dark by default |
| Analytics | Databuddy |
| Language | TypeScript, strict |

Notable component-level dependencies: `vaul` (drawer), `react-use-measure` (height animation), `flubber` (SVG path morphing), `@squircle-js/react` and `figma-squircle` (smooth corners), `prism-react-renderer` (syntax highlighting), `react-apple-emojis`, `lucide-react`.

## Directory layout

```
app/
  layout.tsx              root layout, fonts, theme provider, JSON-LD
  page.tsx                landing page
  globals.css             the entire design token system
  components/
    page.tsx              gallery index
    (docs)/
      layout.tsx          sidebar shell for all component docs
      [slug]/page.tsx     catch-all, resolves unknown slugs
      <slug>/page.tsx     one route per component
      <slug>/demo.tsx     the live preview rendered in that route
  400|401|402/            the three full-viewport error screens
  api/source/route.ts     serves raw component source to the code drawer
  llms.txt/route.ts       machine-readable component index
  sitemap.ts, robots.ts   generated from lib/components.ts

components/
  ui/                     the 18 shipped registry components
  error-pages/            shell, logo, and the error screen bodies
  Sidebar/                docs navigation shell, desktop and mobile
  Description/            the docs panel: props table, install bar, code drawer
  gallery/                cards and video previews for the index
  preview/                controls that drive a live demo
  sponsors/, legal/       page-specific sections
  Navbar, Footer, Hero*   site chrome

lib/
  components.ts           single source of truth for all component metadata
  site.ts                 name, URL, tagline, description
  seo.ts                  keywords and JSON-LD
  utils.ts                the cn() helper
  github.ts, sponsors.ts, legal.ts, webgl.ts, use-media-query.ts

public/
  r/*.json                built registry, consumed by the shadcn CLI
  componentdemos/*.mp4    preview videos used on the gallery cards
  fonts/                  Open Runde woff2 files
```

### Two kinds of component

The distinction matters and is enforced by review.

- **`components/ui/*`** are the product. They ship to users through the registry. They must be self-contained, dependency-honest, and follow the hygiene rules below.
- **Everything else in `components/`** is site chrome. It exists only to present the product and is not distributed.

## Single source of truth

`lib/components.ts` is the spine of the site. One `ComponentItem` entry drives the gallery card, the sidebar link, the docs page, the props table, the install command, the sitemap, and `llms.txt`. Adding a component means adding an entry there, not editing six files.

```ts
type ComponentItem = {
  name: string;
  href: string;
  category: ComponentCategory;
  isNew?: boolean;
  featured?: boolean;
  description?: string;   // one sentence: what it is, never how it works
  registry?: string;      // registry item name, kebab-case
  source?: string;        // GitHub blob URL
  preview?: string;       // /componentdemos/*.mp4
  dependencies?: Dependency[];
  interaction?: string;   // what the user can do and see
  usage?: string;         // minimal runnable example
  props?: ComponentProp[];
  credits?: string[];
};
```

Each field has exactly one job and facts are never repeated across fields. `description` says what the component is. `interaction` says what the user can do. `props` is the only place prop details live.

### Categories

Five categories, with a fixed display order that is deliberately not alphabetical:

```
display  ->  ai  ->  navigation  ->  inputs  ->  feedback
```

`display` leads because the most visually striking components live there. Labels are defined once in `CATEGORY_LABELS`, where `ai` renders as "AI kit".

### The 18 shipped components

| Component | Registry name | Category |
| --- | --- | --- |
| Folder component | `folder-component` | display |
| Gravity Letters | `gravity-letters` | display |
| Code Block | `code-block` | display |
| GitHub activity | `github-activity` | display |
| Step player | `step-player` | display |
| Animated counter | `animated-counter` | display |
| Fluid Orb | `fluid-orb` | ai |
| Grid Reveal | `grid-reveal` | ai |
| Bounce sidebar | `bounce-sidebar` | navigation |
| Hook Sidebar | `hook-sidebar` | navigation |
| Proximity Sidebar | `proximity-sidebar` | navigation |
| Scroll Progress | `scroll-progress` | navigation |
| Gooey nav | `gooey-nav` | navigation |
| Duration Picker | `duration-picker` | inputs |
| OTP Input | `otp-input` | inputs |
| Delete button | `delete-button` | inputs |
| Emoji reaction | `emoji-reaction` | feedback |
| Notification bell | `notification-bell` | feedback |

## Design tokens

All tokens live in `app/globals.css`. There is no `tailwind.config.js`; Tailwind v4 reads the CSS directly. The file has three parts:

1. `:root` defines the light palette as raw values.
2. `.dark` redefines the same names for dark.
3. `@theme inline` maps each token to a Tailwind utility namespace, so `--color-background` becomes `bg-background`.

Adding a color means adding it in all three places. A token defined only inside `.dark` will break light mode.

### Color

Colors are authored in `oklch` for perceptual consistency, with a few deliberate hex exceptions where an exact value was wanted: `--card: #EBEBEB`, `--popover: #262626`, `--muted: #171717`, `--primary: #000`.

The semantic set follows the shadcn convention: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1` through `chart-5`, and a full `sidebar-*` group.

The two themes are not the same design tuned for brightness; they diverge on purpose:

- **Light** is a white ground with a blue accent (`oklch(0.9514 0.0250 236.8242)`) and a blue ring. Charts run through a blue ramp.
- **Dark** is a true black ground (`oklch(0 0 0)`, not a soft charcoal) with an orange accent (`oklch(0.6617 0.2215 36.9340)`) that also becomes the focus ring.

Dark is the default theme (`defaultTheme="dark"` in `app/layout.tsx`) with system detection enabled.

The brand orange `#fc4c01` appears outside the token set in the text selection style, at 10 percent opacity behind orange text. `.selection-contrast` overrides the selection foreground to black in light and white in dark, for surfaces where the orange would not read.

### Hardcoded surface pairs

Several components carry their own surface colors rather than using tokens, because they are designed as physical objects with their own material:

```
SURFACE  bg-[#F4F4F9]  dark:bg-[#262626]
RECESS   bg-[#E7E7EF]  dark:bg-[#1B1B1B]
GLYPH    text-[#868593] dark:text-[#9B9AA7]
ACCENT   #FF5F2E
```

These repeat across `delete-button`, `emoji-reaction`, `gooey-nav`, and `otp-input`. If you build a component in that family, reuse the exact values.

### Typography

Five families, all wired through CSS variables in `app/layout.tsx`:

| Token | Family | Source | Role |
| --- | --- | --- | --- |
| `--font-sans` | Inter | next/font/google | body, the default on `<body>` |
| `--font-mono` | Geist Mono | next/font/google | code |
| `--font-cal` | Cal Sans | next/font/google | display headings |
| `--font-runde` | Open Runde | local woff2, 400/500/600/700 | rounded UI text |
| `--font-serif` | Source Serif 4 | declared token | reserved |

Open Runde is self-hosted from `public/fonts/`. Cal Sans logs a harmless "Failed to find font override values" warning in dev because Next has no metrics to build a fallback from; it does not affect rendering.

### Radius, shadow, spacing

Radius derives from one base:

```
--radius: 0.375rem
--radius-sm:  calc(var(--radius) - 4px)
--radius-md:  calc(var(--radius) - 2px)
--radius-lg:  var(--radius)
--radius-xl:  calc(var(--radius) + 4px)
```

Components that need a squircle bypass this and use `figma-squircle` with an explicit corner radius, for example `CORNER_RADIUS = 12` in the duration picker, and per-size radii in `gooey-nav` and `otp-input`.

Shadows are a single soft family. Every step from `2xs` to `xl` keeps the same `0 1px 3px` contact shadow and only grows the second, wider layer. The result is depth without a visible drop shadow. `--shadow-2xl` breaks the pattern with one denser layer at 25 percent.

Spacing is the Tailwind default `0.25rem` base.

### Custom utilities

```
@utility border-apple   three inset shadows faking a beveled edge
.no-scrollbar           hides the scrollbar, keeps the scroll
```

`border-apple` is how raised surfaces get their rim: a hairline white inset, a lighter top edge, a darker bottom edge.

## Component hygiene

Every file in `components/ui/*` must satisfy all of these:

1. **`cn()` merge.** Accept a `className` prop and merge it, so consumers can override without `!important`.
2. **Prop spread.** Remaining props spread onto the root element.
3. **`data-slot` on the root.** Gives consumers a stable styling and testing hook.
4. **Reduced motion.** Honor `prefers-reduced-motion`, via `useReducedMotion()` or `matchMedia`. See `ANIMATION.md`.
5. **Typed props.** Extend `ComponentProps<"div">`, or the right element, rather than inventing a shape.
6. **Comments.** Short, lowercase, one line, only where the code cannot say it itself. No JSDoc, no section banners.

Client components declare `"use client"` at the top. Most `ui/*` components need it; the docs pages around them stay server components where possible.

## The docs system

Every component route follows the same shape. `app/components/(docs)/<slug>/page.tsx` pulls its entry from `lib/components.ts` and renders `DescriptionPanel` around a `demo.tsx`. The route group `(docs)` supplies the sidebar shell without adding a URL segment.

The panel is assembled from `components/Description/`:

- `InstallBar` and `InstallCommand` render the shadcn add command from the `registry` name.
- `DependencyPill` lists runtime dependencies.
- `PropsTable` renders the `props` array, including the `swatch` control for color props.
- `SourceSection` and `CodeDrawer` fetch live source through `app/api/source/route.ts`, so the documented code cannot drift from the shipped code.
- `PANEL_INFO` carries the shared credits, license, and contact copy.

`app/components/(docs)/[slug]/page.tsx` catches unknown slugs and renders the local `not-found.tsx`.

Note that `/components/foldercomponent` is the docs route while `/folder-component` is a separate standalone page. Both exist and both resolve.

## Error screens

Three full-viewport error pages live at `/400`, `/401`, and `/402`, built from `components/error-pages/`. They are site chrome, not registry components, so they are not distributed.

| Route | Screen | Motion |
| --- | --- | --- |
| `/400` | logo alone on the canvas | the mark drifts and bounces like a DVD screensaver, never reaching a corner |
| `/401` | one giant bloom filling the lower frame | rises in on load |
| `/402` | the same bloom as four blurred, tinted layers | slow breathing pulse |

`ErrorShell` is `fixed inset-0 overflow-hidden`, so a screen owns the viewport outright and nothing can scroll. Every measurement is a viewport unit or a `clamp()`.

Shared constants sit in `ErrorShell.tsx`: `CANVAS #171717`, `INK #292929` for the numeral, `MUTED_LINK #808080`, `FLAME #FC4C01`. Type is `font-runde` throughout; the Figma calls for SF Compact Rounded on the back link, and Open Runde is the project's own rounded face, so it stands in.

The flower is `RareFlower`, the project logo inlined as an SVG that takes `currentColor`. That keeps `/402` able to tint each blurred layer separately, which is what carries the core to white; an additive blend cannot, because the flame colour has no blue to add.

Entrance animations are CSS keyframes in `app/globals.css` rather than Motion, so an error screen renders correctly even if its JavaScript never runs. See `ANIMATION.md` for the values.

## Registry pipeline

`registry.json` holds 21 items: the 18 components, the `utils` lib item, and supporting entries. Each declares its npm `dependencies` and its `registryDependencies`, and nearly all depend on `utils` for `cn`.

```bash
npm run registry:build   # shadcn build, writes public/r/*.json
npm run build            # shadcn build && next build
```

After touching anything in `components/ui/*` or `registry.json`, run `registry:build` so `public/r/*.json` stays in sync. The description in `registry.json` must match the one in `lib/components.ts` exactly.

## SEO

Metadata is centralized. `lib/site.ts` holds the name, URL, tagline, and description; `lib/seo.ts` holds keywords and the JSON-LD builder. `app/layout.tsx` sets `metadataBase`, a `%s | Rare UI` title template, Open Graph, and Twitter cards against `/ogimage.webp` at 2400x1260.

`sitemap.ts` and `robots.ts` generate from the same `lib/components.ts` array, so a new component appears in the sitemap automatically. `app/llms.txt/route.ts` publishes a machine-readable index for LLM consumers.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
```

Verify with `npx tsc --noEmit` and `npx eslint` on touched files before calling work done.

### Windows setup notes

Two environment issues are fixed in the repo and worth knowing about:

- **`.npmrc`** pins `os=win32`. The user-level `~/.npmrc` on this machine sets `os=linux`, which makes npm silently skip every Windows native binary: `@tailwindcss/oxide`, `lightningcss`, `@next/swc`, `sharp`, `unrs-resolver`. Without the override the dev server boots and then returns 500 on every page. If you hit that, delete `node_modules` and reinstall.
- **`next.config.ts`** pins `turbopack.root` to the project directory. A stray `package-lock.json` in the home directory made Turbopack infer the home folder as the workspace root and watch all of it.

Per `CONVENTIONS.md`, do not start dev servers or install packages unprompted; the maintainer tests in their own browser.
