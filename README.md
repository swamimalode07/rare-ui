<div align="center">
  <a href="https://rareui.com">
    <img src="public/assets/repoassets/repoimg.png" alt="Rare UI" width="100%" />
  </a>
  <br />
  <br />
  <a href="https://vercel.com/open-source-program">
    <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge-2026.svg" />
  </a>
</div>

<div align="center">

**A shadcn registry of rare, ready-to-use components and animations.**

<img src="https://img.shields.io/badge/Next.js-0a0a0a?logo=nextdotjs&logoColor=FC4C01" alt="Next.js" />
<img src="https://img.shields.io/badge/Tailwind_CSS-0a0a0a?logo=tailwindcss&logoColor=FC4C01" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/TypeScript-0a0a0a?logo=typescript&logoColor=FC4C01" alt="TypeScript" />
<img src="https://img.shields.io/badge/shadcn-registry-FC4C01?labelColor=0a0a0a" alt="shadcn registry" />
<img src="https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause%20%2B%20Attribution-0a0a0a?labelColor=0a0a0a&color=FC4C01" alt="MIT + Commons Clause + Attribution" />

[**rareui.com**](https://rareui.com) &nbsp;&middot;&nbsp; [Components](https://rareui.com/components) &nbsp;&middot;&nbsp; [Follow on X](https://x.com/swamimalode)

</div>

<br />

Rare UI is a shadcn registry built with Next.js, Tailwind CSS, and TypeScript. Every component is animated with Motion, honors `prefers-reduced-motion`, and installs straight into your codebase. You own the code: no package to depend on, restyle anything.

## Sponsors

<table align="center">
<tr>
<td align="center" width="340">
  <a href="https://runable.com/?utm_source=rareui&utm_medium=referral&utm_campaign=readme">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/logos/runablewhite.png" />
      <img src="public/logos/runabledark.png" alt="Runable" width="240" />
    </picture>
  </a>
  <br />
  <sub>Diamond Sponsor</sub>
</td>
<td align="center" width="340">
  <a href="https://privatealps.net/?utm_source=rareui&utm_medium=referral&utm_campaign=readme">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/logos/privatealpswhite.png" />
      <img src="public/logos/privatealpsdark.png" alt="PrivateAlps" width="200" />
    </picture>
  </a>
  <br />
  <sub>Diamond Sponsor</sub>
</td>
</tr>
</table>

### Platform Sponsors

<div align="center"><sub>Products that back Rare UI through their open-source programs.</sub></div>

<table align="center">
<tr>
<td align="center" width="340">
  <a href="https://www.databuddy.cc/?utm_source=rareui&utm_medium=referral&utm_campaign=readme">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/logos/databuddywhite.svg" />
      <img src="public/logos/databuddydark.svg" alt="Databuddy" width="180" />
    </picture>
  </a>
  <br />
  <sub>Analytics Sponsor</sub>
</td>
</tr>
</table>

Rare UI is free. Sponsorship keeps it that way. See the tiers at [rareui.com/sponsors](https://rareui.com/sponsors).

## Quick start

Install any component with the shadcn CLI:

```bash
npx shadcn@latest add swamimalode07/rare-ui/{component-name}
```

For example:

```bash
npx shadcn@latest add swamimalode07/rare-ui/fluid-orb
```

Browse every component, with live previews and props, at [rareui.com/components](https://rareui.com/components).

## MCP (Claude Code, Cursor, Codex)

In your project, add this to `components.json`:

```json
{
  "registries": {
    "@rare-ui": "https://raw.githubusercontent.com/swamimalode07/rare-ui/main/public/r/{name}.json"
  }
}
```

Then:

```bash
npx shadcn@latest mcp init --client claude
# or: --client cursor | vscode
```

Ask: `add @rare-ui/fluid-orb`

Or just: `Add the fluid orb from Rare UI`

Not `add fluid-orb` on its own. That looks in the default shadcn registry.

Full steps: [rareui.com/mcp](https://rareui.com/mcp).

## Running locally

```bash
git clone https://github.com/swamimalode07/rare-ui.git
cd rare-ui
npm install
npm run dev
```

Components live in `components/ui`. After changing a component or `registry.json`, rebuild the registry output with `npm run registry:build`.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full walkthrough, from creating a component to a working install command.

## License

MIT with the [Commons Clause and an attribution requirement](LICENSE). Use, modify and ship the components in anything you build, personal or commercial, closed source included.

Credit is required. Any project shipping a Rare UI component must credit Rare UI with a visible link to [rareui.com](https://rareui.com), in a footer, an about page, a credits screen or a README, and must keep the credit and copyright notice in the source it copied.

You may not sell, sublicense or redistribute the components themselves, alone, in a bundle, or ported to another framework.

The name Rare UI, the logo and the site design are not covered by the license.

<div align="center">
  <br />
  <img src="public/logos/Rareui.svg" alt="" width="28" />
  <p><sub>Built by <a href="https://x.com/swamimalode">@swamimalode</a></sub></p>
</div>
