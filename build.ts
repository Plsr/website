// Tiny SSG: content/**/*.md → dist/, pages/**/*.html → dist/ (nav/footer markers), static/ → dist/.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { Marked } from "marked";
import { footer, layout, nav } from "./templates.ts";

export const OUT = "dist";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const write = (path: string, html: string) => {
  mkdirSync(dirname(join(OUT, path)), { recursive: true });
  writeFileSync(join(OUT, path), html);
};

// The page title is the h1, so body headings start at h2.
const md = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const level = Math.min(depth + 1, 6);
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
  },
});

type Entry = { slug: string; title: string; date: Date; url: string; source?: string; html: string };

function load(dir: string): Entry[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f): Entry | null => {
      const { data, content } = matter(readFileSync(join(dir, f), "utf8"));
      if (data.hidden) return null;
      const slug = f.slice(0, -3);
      return {
        slug,
        title: data.title ?? slug,
        date: new Date(data.date ?? 0),
        url: data.url,
        source: data.source,
        html: md.parse(content) as string,
      };
    })
    .filter((e) => e !== null)
    .sort((a, b) => +b.date - +a.date);
}

// ponytail: three hardcoded collections, make this a config list if more appear.
const collections = [
  { dir: "content/posts", base: "/p", index: "/posts", heading: "Posts" },
  { dir: "content/bookmarks", base: "/bookmarks", index: "/bookmarks", heading: "Bookmarks" },
  { dir: "content/notes", base: "/notes", index: "/notes", heading: "Notes" },
];

// Standalone Markdown pages: content/pages/<slug>.md → /<slug>
function standalone() {
  for (const e of load("content/pages")) {
    write(`/${e.slug}/index.html`, layout(esc(e.title), `<article><h1>${esc(e.title)}</h1>${e.html}</article>`, `/${e.slug}`));
  }
}

// One-off pages: copied as-is, with <!-- nav --> / <!-- footer --> swapped for the shared parts.
function pages(dir: string, rel = "") {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const path = join(rel, f.name);
    if (f.isDirectory()) pages(join(dir, f.name), path);
    else if (f.name.endsWith(".html")) {
      const name = path.slice(0, -5);
      const url = name === "index" ? "/" : `/${name.replace(/\/index$/, "")}`;
      const html = readFileSync(join(dir, f.name), "utf8").replace("<!-- nav -->", nav(url)).replace("<!-- footer -->", footer());
      write(name === "index" || name.endsWith("/index") ? `${name}.html` : `${name}/index.html`, html);
    }
  }
}
export function build() {
  rmSync(OUT, { recursive: true, force: true });
  if (existsSync("static")) cpSync("static", OUT, { recursive: true });

  for (const c of collections) {
    const entries = load(c.dir);
    for (const e of entries) {
      const link = e.url ? `<p><a href="${e.url}">${esc(e.source ?? e.url)}</a></p>` : "";
      write(`${c.base}/${e.slug}/index.html`, layout(esc(e.title), `<article><h1>${esc(e.title)}</h1>${link}${e.html}</article>`, `${c.base}/${e.slug}`));
    }
    const items = entries.map((e) => `<li><a href="${c.base}/${e.slug}">${esc(e.title)}</a></li>`).join("\n");
    write(`${c.index}/index.html`, layout(c.heading, `<h1>${c.heading}</h1><ul>${items}</ul>`, c.index));
  }

  standalone();
  pages("pages");
  console.log(`built → ${OUT}/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
