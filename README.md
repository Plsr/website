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

## Feature flags

Boolean flags that can be toggled at runtime, without a deploy, at `/admin/flags`.

- `feature-flags.json` is the registry. Every flag must be declared there with a default and a description:

  ```json
  {
    "new-footer": {
      "default": false,
      "description": "Shows the redesigned footer"
    }
  }
  ```

  Adding or removing a flag needs a deploy; toggling it doesn't.

- Toggled values are stored in Redis (`REDIS_URL`). A flag that was never toggled, or any flag while Redis is unavailable, uses its default. "Reset" in the admin goes back to the default.
- Read a flag in a Server Component or Server Action:

  ```ts
  import { getFlag } from "@/lib/flags";

  if (await getFlag("new-footer")) {
    // ...
  }
  ```

  Names are typed from `feature-flags.json`, so an undeclared name fails the typecheck; at runtime the flag service throws for it. A page that reads a flag is rendered per request instead of being prerendered, so a toggle takes effect on the next request.

- `/admin` pages use the Keystatic GitHub login: sign in at `/keystatic` first. Only GitHub users with push access to `plsr/website` get in (`lib/admin-auth.ts`). In development (Keystatic local mode) they're open.

Run Redis locally with `docker compose up redis`, then start the dev server with `REDIS_URL=redis://localhost:6379 pnpm dev`.

## Keystatic in production

Outside development, Keystatic uses GitHub storage: you sign in with GitHub at `/keystatic` and edits are committed to `plsr/website`, which triggers a deploy. Local storage mode has no authentication, so it's only used with `pnpm dev`.

Set these environment variables in production:

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (inlined at build time)
- `REDIS_URL` (feature flags)

They're only needed at runtime: the Keystatic API route is created on the first request, so the Docker build works without them. Until they're set, `/api/keystatic` responds with an error.

Creating the GitHub App:

1. Temporarily set `storage` in `keystatic.config.ts` to `{ kind: "github", repo: "plsr/website" }` and run `pnpm dev`. Keystatic's setup flow only runs in development.
2. Open `http://127.0.0.1:3000/keystatic/setup` (Keystatic redirects `localhost` to `127.0.0.1` in GitHub mode).
3. **Paste** the full production URL (`https://chrisjarling.com`) into "Deployed App URL" rather than typing it: Keystatic parses the field on every keystroke and crashes on a partial URL. Leaving it blank also works; add the production callback URL in the GitHub App settings later.
4. Follow the steps. Keystatic writes the app's values to `.env`. Copy them to the production environment and revert the `storage` change.
