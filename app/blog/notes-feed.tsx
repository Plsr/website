import { createReader } from "@keystatic/core/reader";
import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import Link from "next/link";
import React from "react";
import keystaticConfig from "@/keystatic.config";
import { applyFootnotes } from "@/lib/footnotes";

const NOTES_PER_PAGE = 10;

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

async function visibleNotes() {
  const notes = await reader.collections.notes.all();
  return notes
    .filter((note) => !note.entry.hidden)
    .sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));
}

function totalPages(noteCount: number) {
  return Math.max(1, Math.ceil(noteCount / NOTES_PER_PAGE));
}

export async function pageCount() {
  return totalPages((await visibleNotes()).length);
}

function pageHref(page: number) {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

export async function NotesFeed({ page }: { page: number }) {
  const notes = await visibleNotes();
  const pages = totalPages(notes.length);
  const pageNotes = notes.slice(
    (page - 1) * NOTES_PER_PAGE,
    page * NOTES_PER_PAGE,
  );

  const rendered = await Promise.all(
    pageNotes.map(async (note) => {
      const { node } = await note.entry.content();
      const errors = Markdoc.validate(node);
      if (errors.length) throw new Error(`Invalid content in note ${note.slug}`);
      const renderable = applyFootnotes(
        Markdoc.transform(node, markdocConfig),
        `${note.slug}-`,
      );
      return { slug: note.slug, entry: note.entry, renderable };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <h1 className="mb-8 text-2xl font-semibold">Blog</h1>
      <div className="space-y-12">
        {rendered.map((note) => (
          <article
            key={note.slug}
            id={note.slug}
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
      {pages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-16 flex items-center justify-between text-sm text-gray-500"
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} rel="next">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
