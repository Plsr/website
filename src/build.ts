import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import markedFootnote from "marked-footnote";
import type { Post, PostMeta, Page, PageMeta, Link } from "./types.js";
import { indexPage, postPage, pagePage, linksPage, linkPage } from "./templates.js";

marked.use(markedFootnote());
marked.use({
  walkTokens: (token) => {
    if (token.type === "heading") {
      token.depth = Math.min(token.depth + 1, 6);
    }
  },
});

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const PAGES_DIR = path.join(ROOT, "pages");
const LINKS_DIR = path.join(ROOT, "links");
const DIST_DIR = path.join(ROOT, "dist");

function loadPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = path.basename(file, ".md");

      if (!data.title) throw new Error(`Post "${file}" is missing a title`);
      if (!data.date) throw new Error(`Post "${file}" is missing a date`);

      const html = marked(content) as string;

      const rawDate: unknown = data.date;
      const dateStr =
        rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : String(rawDate).slice(0, 10);

      return {
        slug,
        title: data.title as string,
        date: dateStr,
        description: data.description as string | undefined,
        hidden: Boolean(data.hidden),
        html,
      };
    });
}

function write(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  wrote ${path.relative(ROOT, filePath)}`);
}

function loadPages(): Page[] {
  if (!fs.existsSync(PAGES_DIR)) return [];

  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = path.basename(file, ".md");

      if (!data.title) throw new Error(`Page "${file}" is missing a title`);

      const html = marked(content) as string;

      return {
        slug,
        title: data.title as string,
        nav: Boolean(data.nav),
        html,
      };
    });
}

function loadLinks(): Link[] {
  if (!fs.existsSync(LINKS_DIR)) return [];

  return fs
    .readdirSync(LINKS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(LINKS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = path.basename(file, ".md");

      if (!data.title) throw new Error(`Link "${file}" is missing a title`);
      if (!data.date) throw new Error(`Link "${file}" is missing a date`);
      if (!data.url) throw new Error(`Link "${file}" is missing a url`);

      const html = marked(content) as string;

      const rawDate: unknown = data.date;
      const dateStr =
        rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : String(rawDate).slice(0, 10);

      return {
        slug,
        title: data.title as string,
        date: dateStr,
        url: data.url as string,
        html,
      };
    });
}

export function build(): void {
  console.log("building...");

  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  const posts = loadPosts();
  const pages = loadPages();
  const links = loadLinks();
  const navPages = pages.filter((p) => p.nav) as PageMeta[];

  const visiblePosts = posts.filter((p) => !p.hidden);

  // index
  write(path.join(DIST_DIR, "index.html"), indexPage(visiblePosts as PostMeta[], navPages));

  // individual posts
  for (const post of visiblePosts) {
    write(path.join(DIST_DIR, "p", post.slug, "index.html"), postPage(post, navPages));
  }

  // individual pages
  for (const page of pages) {
    write(path.join(DIST_DIR, page.slug, "index.html"), pagePage(page, navPages));
  }

  // links feed + individual link pages
  write(path.join(DIST_DIR, "links", "index.html"), linksPage(links, navPages));
  for (const link of links) {
    write(path.join(DIST_DIR, "links", link.slug, "index.html"), linkPage(link, navPages));
  }

  // copy stylesheet if it exists
  const cssSource = path.join(ROOT, "style.css");
  if (fs.existsSync(cssSource)) {
    fs.copyFileSync(cssSource, path.join(DIST_DIR, "style.css"));
    console.log("  wrote dist/style.css");
  }

  console.log(`done. ${visiblePosts.length} post(s), ${pages.length} page(s), ${links.length} link(s) built.`);
}

// Only run when invoked directly (not imported by dev server)
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}
