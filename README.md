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
