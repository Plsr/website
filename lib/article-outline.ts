import { Tag, type RenderableTreeNode } from "@markdoc/markdoc";
import type { TocHeading } from "@/lib/toc";

/** Reading-time pace from the agreed scope. */
export const WORDS_PER_MINUTE = 200;

const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/**
 * Stable anchor for a heading that does not already have one.
 * Letters and digits are kept, punctuation becomes a single hyphen, and the
 * result always starts with a letter so it is a valid fragment.
 * Duplicate headings are not handled here; {@link claimHeadingId} suffixes those.
 */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return "section";
  if (!/^[a-z]/.test(slug)) return `section-${slug}`;
  return slug;
}

/**
 * Reserve `preferred` if it is free. When it is already used, suffix `-2`,
 * `-3`, and so on, so the second identical heading is `slug-2`.
 */
export function claimHeadingId(preferred: string, used: Set<string>): string {
  const base = preferred.trim() || "section";
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let n = 2;
  let candidate = `${base}-${n}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  used.add(candidate);
  return candidate;
}

function explicitId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function textContent(node: RenderableTreeNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!Tag.isTag(node)) return "";
  return node.children.map(textContent).join("");
}

function plainText(nodes: RenderableTreeNode[]): string {
  return nodes.map(textContent).join("").replace(/\s+/g, " ").trim();
}

/**
 * Give every rendered h2 and h3 a stable id and collect them in document order.
 * An id already on the heading is kept when it is unique. h1 and h4–h6 are
 * left unchanged and are not part of the outline. The returned tree is what
 * the page renders, so the anchors exist without client JavaScript.
 */
export function applyArticleOutline(tree: RenderableTreeNode): {
  tree: RenderableTreeNode;
  headings: TocHeading[];
} {
  const used = new Set<string>();
  const headings: TocHeading[] = [];

  function visit(node: RenderableTreeNode): RenderableTreeNode {
    if (!Tag.isTag(node)) return node;
    const children = node.children.map(visit);
    if (node.name !== "h2" && node.name !== "h3") {
      return new Tag(node.name, node.attributes, children);
    }

    const text = plainText(children);
    const id = claimHeadingId(explicitId(node.attributes.id) ?? slugifyHeading(text), used);
    headings.push({
      id,
      text: text || id,
      level: node.name === "h2" ? 2 : 3,
    });
    return new Tag(node.name, { ...node.attributes, id }, children);
  }

  return { tree: visit(tree), headings };
}

function classNames(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value.split(/\s+/).filter(Boolean);
}

function skipWords(node: Tag): boolean {
  if (node.name === "pre" || node.name === "script" || node.name === "style") return true;
  const classes = classNames(node.attributes.class);
  return classes.includes("footnote-ref") || classes.includes("footnote-backref");
}

/** Words in article prose. Code blocks and footnote markers are not counted. */
export function countArticleWords(tree: RenderableTreeNode): number {
  if (typeof tree === "string") return tree.match(WORD)?.length ?? 0;
  if (typeof tree === "number") return String(tree).match(WORD)?.length ?? 0;
  if (!Tag.isTag(tree) || skipWords(tree)) return 0;
  return tree.children.reduce<number>((sum, child) => sum + countArticleWords(child), 0);
}

/** Ceil(words / 200), and never less than one minute. */
export function readingTimeMinutes(
  words: number,
  wordsPerMinute = WORDS_PER_MINUTE,
): number {
  const safeWords = Number.isFinite(words) && words > 0 ? words : 0;
  const pace =
    Number.isFinite(wordsPerMinute) && wordsPerMinute > 0
      ? wordsPerMinute
      : WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(safeWords / pace));
}

export function readingTimeLabel(minutes: number): string {
  return `About ${minutes} min read`;
}
