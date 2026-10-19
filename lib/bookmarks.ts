import { createReader } from "@keystatic/core/reader";
import Markdoc, {
  nodes,
  Tag,
  type Config,
  type Node,
  type RenderableTreeNode,
} from "@markdoc/markdoc";
import keystaticConfig from "@/keystatic.config";
import { applyFootnotes } from "@/lib/footnotes";

const markdocConfig = {
  nodes: {
    heading: {
      ...nodes.heading,
      transform(node: Node, config: Config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        const level = Math.min(node.attributes.level + 1, 6);
        return new Tag(`h${level}`, attributes, children);
      },
    },
  },
};

const reader = createReader(process.cwd(), keystaticConfig);

const DESCRIPTION_MAX = 160;

export const bookmarksDescription =
  "Articles Chris Jarling has read and found worth rereading.";

export type BookmarkEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.bookmarks.read>>
>;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isVisibleBookmark(entry: {
  hidden: boolean;
  url: string;
}): boolean {
  return !entry.hidden && isHttpUrl(entry.url);
}

export async function listBookmarkSlugs(): Promise<string[]> {
  return reader.collections.bookmarks.list();
}

export async function readBookmark(slug: string): Promise<BookmarkEntry | null> {
  return reader.collections.bookmarks.read(slug);
}

export async function listVisibleBookmarks(): Promise<
  { slug: string; entry: BookmarkEntry; renderable: RenderableTreeNode | null }[]
> {
  const bookmarks = await reader.collections.bookmarks.all();
  const visible = bookmarks
    .filter((bookmark) => isVisibleBookmark(bookmark.entry))
    .sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));

  return Promise.all(
    visible.map(async (bookmark) => ({
      slug: bookmark.slug,
      entry: bookmark.entry,
      renderable: await renderBookmarkNotes(bookmark.slug, bookmark.entry),
    })),
  );
}

export async function renderBookmarkNotes(
  slug: string,
  entry: BookmarkEntry,
): Promise<RenderableTreeNode | null> {
  const node = await loadNotes(entry);
  const errors = Markdoc.validate(node);
  if (errors.length) {
    throw new Error(`Invalid content in bookmark ${slug}`);
  }
  if (isEmptyNotes(node)) return null;
  return applyFootnotes(
    Markdoc.transform(node, markdocConfig),
    `${slug}-`,
  );
}

export async function bookmarkDescription(entry: BookmarkEntry): Promise<string> {
  const node = await loadNotes(entry);
  const text = firstBlockText(node);
  return text ? excerpt(text) : bookmarksDescription;
}

// Optional reader options widen Markdoc fields into a union of the loaded
// document and the lazy loader. Accept either shape.
async function loadNotes(entry: BookmarkEntry): Promise<Node> {
  const content = entry.notes;
  const loaded = typeof content === "function" ? await content() : content;
  return loaded.node;
}

// Empty only when the document has no children, or nothing but whitespace
// text. Leaf nodes such as images and horizontal rules still count.
function isEmptyNotes(node: Node): boolean {
  return containsOnlyWhitespace(node.children);
}

function containsOnlyWhitespace(children: Node[]): boolean {
  return children.every((child) => {
    if (child.type === "text") {
      const content = child.attributes.content;
      return typeof content !== "string" || content.trim() === "";
    }
    if (child.children.length === 0) return false;
    return containsOnlyWhitespace(child.children);
  });
}

function firstBlockText(node: Node): string {
  for (const child of node.children) {
    if (child.type !== "paragraph") continue;
    const text = collectText(child);
    if (text) return text;
  }
  return "";
}

// Inline fragments keep their own whitespace and are concatenated. A space is
// inserted only between blocks, after each block's whitespace is collapsed.
function collectText(node: Node): string {
  const blocks = node.children.filter(isBlock);
  if (blocks.length > 0) {
    return blocks
      .map((child) => collectText(child))
      .filter(Boolean)
      .join(" ");
  }
  const parts: string[] = [];
  for (const child of node.children) appendText(child, parts);
  return parts.join("").replace(/\s+/g, " ").trim();
}

function appendText(node: Node, parts: string[]) {
  if (node.type === "text") {
    const content = node.attributes.content;
    if (typeof content === "string") parts.push(content);
    return;
  }
  if (node.type === "softbreak" || node.type === "hardbreak") {
    parts.push(" ");
    return;
  }
  if (isBlock(node)) return;
  for (const child of node.children) appendText(child, parts);
}

function isBlock(node: Node): boolean {
  return (
    node.type === "blockquote" ||
    node.type === "fence" ||
    node.type === "heading" ||
    node.type === "hr" ||
    node.type === "item" ||
    node.type === "list" ||
    node.type === "paragraph" ||
    node.type === "table" ||
    node.type === "tbody" ||
    node.type === "td" ||
    node.type === "th" ||
    node.type === "thead" ||
    node.type === "tr"
  );
}

function excerpt(text: string): string {
  if (text.length <= DESCRIPTION_MAX) return text;
  const slice = text.slice(0, DESCRIPTION_MAX + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut =
    lastSpace > 80 ? slice.slice(0, lastSpace) : text.slice(0, DESCRIPTION_MAX);
  return `${cut.trimEnd()}…`;
}
