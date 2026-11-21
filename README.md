# Rare UI Pro

Private shadcn registry of animated React components, sold as a Pro license. Built with Next.js, Tailwind CSS, Motion, Better Auth, Drizzle (Neon Postgres) and Polar.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill every value.
3. `npm run db:migrate` to create the database tables.
4. `npm run dev`

## How it fits together

- Sign in: Better Auth with Google or email and password, at `/sign-in`.
- Buying: Polar checkout from `/account`. Polar's `order.paid` webhook creates the license, `order.refunded` revokes it.
- CLI token: made on `/account`, stored only as a hash.
- Pro registry: `registry-pro.json` builds into `registry/pro/`, served by `app/r/pro/[name]/route.ts` only with a valid token.
- Source on the site: `/api/source` returns code only to signed-in license holders.

## Adding a Pro component

1. Put the code in `components/pro/<name>.tsx`.
2. Add an item to `registry-pro.json`. Use `utils` in `registryDependencies` if it needs `cn`.
3. Add its entry to `lib/components.ts` and a docs page under `app/components/(docs)/`.
4. `npm run registry:build`

Buyers install with `npx shadcn@latest add @rareui-pro/<name>` after adding the registry from `/account` to their `components.json`.

## Before launch

See `POLAR_SETUP.md`.
