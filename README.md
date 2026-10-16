# Local Setup (pnpm)

## Prerequisites

- Node.js 22.x
- pnpm 9+

Check versions:

```bash
node -v
pnpm -v
```

## Install dependencies

From the project root:

```bash
pnpm install
```

Note: `pnpm-workspace.yaml` must include:

```yaml
packages:
  - "."
```

Without that, `pnpm install` fails with `ERR_PNPM_INVALID_WORKSPACE_CONFIGURATION`.

## Run the local server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
pnpm lint
pnpm build
pnpm start
```

## Optional: silence Next.js workspace-root warning

If Next.js warns about inferring the workspace root because of multiple lockfiles in parent directories, set `turbopack.root` in `next.config.ts` to this project root.

## Keystatic in production

Outside development, Keystatic uses GitHub storage: you sign in with GitHub at `/keystatic` and edits are committed to `plsr/website`, which triggers a deploy. Local storage mode has no authentication, so it's only used with `pnpm dev`.

Set these environment variables in production:

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (inlined at build time)

They're only needed at runtime: the Keystatic API route is created on the first request, so the Docker build works without them. Until they're set, `/api/keystatic` responds with an error.

Creating the GitHub App:

1. Temporarily set `storage` in `keystatic.config.ts` to `{ kind: "github", repo: "plsr/website" }` and run `pnpm dev`. Keystatic's setup flow only runs in development.
2. Open `http://127.0.0.1:3000/keystatic/setup` (Keystatic redirects `localhost` to `127.0.0.1` in GitHub mode).
3. **Paste** the full production URL (`https://chrisjarling.com`) into "Deployed App URL" rather than typing it: Keystatic parses the field on every keystroke and crashes on a partial URL. Leaving it blank also works; add the production callback URL in the GitHub App settings later.
4. Follow the steps. Keystatic writes the app's values to `.env`. Copy them to the production environment and revert the `storage` change.

## Case studies

Case studies are MDX files in `content/case-studies/<slug>.mdx`, edited in Keystatic and rendered at `/work/<slug>`. Posts and notes stay Markdoc.

Create one in Keystatic (Case studies) or as a file:

```mdx
---
title: Evergreen roaming
date: 2026-04-02
description: Roaming without installing a new eSIM.
---

The first section is a normal paragraph.

<Figure src="/images/case-studies/evergreen-roaming/flow.png" alt="Roaming flow" caption="Where the eSIM handoff happens." variant="wide" />

<Callout title="Constraint" tone="note">
The reader should be able to scan this without leaving the column.
</Callout>
```

`Figure` takes `src`, `alt`, an optional `caption`, and `variant`: `content` (the text column), `wide`, or `full`. `Callout` takes an optional `title`, `tone` (`note` or `warning`), and markdown children. Do not import components in the file. Keystatic rejects imports and raw HTML; use Markdown or a registered component.

Images uploaded from the editor land in `public/images/case-studies/<slug>/`.

To add a component:

1. Add its name to `caseStudyComponentNames` in `components/case-study/options.ts`.
2. Build the React component and add it to `caseStudyComponents` in `components/case-study/registry.tsx`.
3. Register a Keystatic content component with the same name in `components/case-study/keystatic.ts` (`block` for a self-closing tag, `wrapper` when it should contain rich text).

Both lists are typed from that name list, so a missing step fails typecheck. Link a homepage row by setting `caseStudy` in `content/projects.ts` to the slug. An unknown slug fails the build.
