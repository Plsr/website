import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Post, PostMeta } from "./types.js";
import { indexPage, postPage } from "./templates.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
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
        html,
      };
    });
}

function write(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  wrote ${path.relative(ROOT, filePath)}`);
}

export function build(): void {
  console.log("building...");

  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  const posts = loadPosts();

  // index
  write(path.join(DIST_DIR, "index.html"), indexPage(posts as PostMeta[]));

  // individual posts
  for (const post of posts) {
    write(path.join(DIST_DIR, "p", post.slug, "index.html"), postPage(post));
  }

  // copy stylesheet if it exists
  const cssSource = path.join(ROOT, "style.css");
  if (fs.existsSync(cssSource)) {
    fs.copyFileSync(cssSource, path.join(DIST_DIR, "style.css"));
    console.log("  wrote dist/style.css");
  }

  console.log(`done. ${posts.length} post(s) built.`);
}

// Only run when invoked directly (not imported by dev server)
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}
