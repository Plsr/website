import { createReader } from "@keystatic/core/reader";
import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import React from "react";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";

const markdocConfig = {
  nodes: {
    heading: {
      ...nodes.heading,
      transform(node: Node, config: Config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        const level = Math.min(node.attributes.level + 2, 6);
        return new Tag(`h${level}`, attributes, children);
      },
    },
  },
};

const reader = createReader(process.cwd(), keystaticConfig);

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short life updates by Chris Jarling.",
};

export default async function NotesIndex() {
  const notes = await reader.collections.notes.all();
  const visible = notes
    .filter((note) => !note.entry.hidden)
    .sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));

  const rendered = await Promise.all(
    visible.map(async (note) => {
      const { node } = await note.entry.content();
      const errors = Markdoc.validate(node);
      if (errors.length) throw new Error(`Invalid content in note ${note.slug}`);
      const renderable = Markdoc.transform(node, markdocConfig);
      return { slug: note.slug, entry: note.entry, renderable };
    }),
  );

  return (
    <main className="mx-auto max-w-prose px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Notes</h1>
      <div className="space-y-12">
        {rendered.map((note) => (
          <article
            key={note.slug}
            className="prose dark:prose-invert prose-h2:text-2xl prose-h2:mb-1"
          >
            <h2>{note.entry.title}</h2>
            <time
              className="block text-sm text-gray-500 mb-4"
              dateTime={note.entry.date}
            >
              {new Date(note.entry.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {Markdoc.renderers.react(note.renderable, React)}
          </article>
        ))}
      </div>
    </main>
  );
}
