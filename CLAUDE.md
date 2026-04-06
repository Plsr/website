# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start dev server with live reload at http://localhost:3000
pnpm build    # Build static site to dist/
```

There are no tests or lint scripts configured.

## Architecture

This is a custom static site generator written in TypeScript, run directly via `tsx` (no compilation step).

**Build pipeline** (`src/build.ts`):
1. Reads all `.md` files from `posts/`
2. Parses frontmatter (`gray-matter`) and renders Markdown to HTML (`marked`)
3. Passes data through HTML template functions (`src/templates.ts`)
4. Writes output to `dist/`: `dist/index.html` and `dist/p/<slug>/index.html`
5. Copies `style.css` to `dist/`

**Dev server** (`src/dev.ts`): Wraps the build in a Node.js HTTP server. Watches `posts/`, `src/`, and `style.css` with chokidar. On change, rebuilds and broadcasts a reload event via SSE to connected browsers (injected `<script>` in HTML responses).

**Post format** — each `.md` file in `posts/` requires YAML frontmatter:
```
---
title: Required
date: YYYY-MM-DD (required)
description: Optional
---
```

The slug is derived from the filename. Posts are sorted reverse-chronologically on the index page.

**URL structure**: `/` → index, `/p/<slug>` → individual post.

The `tsconfig.json` targets `NodeNext` modules but is only used for type checking — `tsx` handles execution directly.
