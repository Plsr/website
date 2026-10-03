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

Creating the GitHub App: run Keystatic once in GitHub mode locally and follow the setup flow at `/keystatic`. It writes the values to `.env`.
