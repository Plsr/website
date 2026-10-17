import { createReader } from "@keystatic/core/reader";
import Markdoc, {
  nodes,
  Tag,
  type Config,
  type Node,
} from "@markdoc/markdoc";
import React from "react";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";
import { RuledList, RuledRow } from "@/components/ruled-list";
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

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Articles Chris Jarling has read and found worth rereading.",
};

const notesClassName =
  "prose dark:prose-invert prose-h1:text-3xl prose-h1:font-normal prose-h1:mb-1 prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg max-w-none break-words";

export default async function BookmarksPage() {
  const bookmarks = await reader.collections.bookmarks.all();
  const visible = bookmarks
    .filter(
      (bookmark) => !bookmark.entry.hidden && isHttpUrl(bookmark.entry.url),
    )
    .sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));

  const rendered = await Promise.all(
    visible.map(async (bookmark) => {
      const { node } = await bookmark.entry.notes();
      const errors = Markdoc.validate(node);
      if (errors.length) {
        throw new Error(`Invalid content in bookmark ${bookmark.slug}`);
      }
      const renderable = isEmptyNotes(node)
        ? null
        : applyFootnotes(
            Markdoc.transform(node, markdocConfig),
            `${bookmark.slug}-`,
          );
      return { slug: bookmark.slug, entry: bookmark.entry, renderable };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <h1 className="mb-16 text-3xl font-normal">Bookmarks</h1>
      {rendered.length === 0 ? (
        <p className="text-gray-500">No bookmarks yet.</p>
      ) : (
        <RuledList>
          {rendered.map((bookmark) => (
            <RuledRow
              key={bookmark.slug}
              title={bookmark.entry.title}
              meta={bookmark.entry.source || undefined}
              href={bookmark.entry.url}
              external
            >
              {bookmark.renderable == null ? null : (
                <div className={notesClassName}>
                  {Markdoc.renderers.react(bookmark.renderable, React)}
                </div>
              )}
            </RuledRow>
          ))}
        </RuledList>
      )}
    </main>
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Empty only when the document has no children, or nothing but whitespace
// text. Leaf nodes such as images and horizontal rules still count.
function isEmptyNotes(node: Node): boolean {
  return containsOnlyWhitespace(node.children);
}

function containsOnlyWhitespace(nodes: Node[]): boolean {
  return nodes.every((child) => {
    if (child.type === "text") {
      const content = child.attributes.content;
      return typeof content !== "string" || content.trim() === "";
    }
    if (child.children.length === 0) return false;
    return containsOnlyWhitespace(child.children);
  });
}
