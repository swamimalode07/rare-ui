# Conventions

How components and their docs are written in this repo. Follow these exactly.

## Copy style

- No em dashes anywhere: descriptions, prop tables, interaction text, code comments. Use a comma, colon, or semicolon instead.
- Short sentences. User-focused. No filler.
- Every number in the docs must match the code. Check the constants before writing one.

## Component entries in lib/components.ts

Each section has one job. Never repeat a fact across sections.

- `description`: one sentence saying what the component is. Never how it works.
- `interaction`: what the user can do and see, in a few short sentences. No implementation details, no prop explanations.
- `props`: one or two short sentences each. What it controls, plus the default behavior if it matters. Prop details live here and nowhere else.
- `usage`: a minimal runnable example. Comments only where something is non-obvious.

## Component code

- Comments are short lowercase one-liners, only where the code is non-obvious. No JSDoc narration.
- Shipped components in `components/ui/*` follow shadcn hygiene: `cn()` merged with a `className` prop, remaining props spread onto the root, `data-slot` on the root element.
- Interactive components honor `prefers-reduced-motion`.

## Workflow

- After changing anything in `components/ui/*` or `registry.json`, run `npm run registry:build` so `public/r/*.json` stays in sync. The registry description must match the one in `lib/components.ts`.
- Verify with `npx tsc --noEmit` and `npx eslint` on the touched files before calling work done.
- Do not start dev servers or install packages unprompted; the user tests in their own browser.
