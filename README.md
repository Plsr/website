# chrisjarling.com

A small static site generator in TypeScript.

- `content/**/*.md` — posts, bookmarks, notes (`/p/<slug>`, `/bookmarks/<slug>`, `/notes/<slug>`)
- `content/pages/*.md` — standalone pages (`/about`, `/cv`)
- `pages/**/*.html` — one-off HTML pages; `<!-- nav -->` and `<!-- footer -->` are replaced with the shared parts
- `static/` — copied to the site root as-is
- `templates.ts` — shared nav, footer, layout

```
pnpm install
pnpm dev     # http://localhost:3000, rebuilds on content changes (restart after editing build.ts/templates.ts)
pnpm build   # → dist/
pnpm check   # type-check
```

## Deploy

Pushing to `main` builds the `Dockerfile` (static build served by nginx), pushes `ghcr.io/plsr/website:latest` and calls the Coolify webhook. Old post URLs are redirected in `nginx.conf`.
