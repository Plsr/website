import { createReader, type Entry } from "@keystatic/core/reader";
import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import Link from "next/link";
import React from "react";
import keystaticConfig from "@/keystatic.config";
import { applyFootnotes } from "@/lib/footnotes";
import { pageCount, pageItems } from "@/lib/pagination";

const NOTES_PER_PAGE = 10;

// Shift note headings below the note title: h1 → h3 under an h2 title in the
// feed, h1 → h2 under the h1 title on a note's own page.
function markdocConfig(headingOffset: number) {
  return {
    nodes: {
      heading: {
        ...nodes.heading,
        transform(node: Node, config: Config) {
          const attributes = node.transformAttributes(config);
          const children = node.transformChildren(config);
          const level = Math.min(node.attributes.level + headingOffset, 6);
          return new Tag(`h${level}`, attributes, children);
        },
      },
    },
  };
}

export const reader = createReader(process.cwd(), keystaticConfig);

type Note = Entry<(typeof keystaticConfig)["collections"]["notes"]>;

async function visibleNotes() {
  const notes = await reader.collections.notes.all();
  return notes
    .filter((note) => !note.entry.hidden)
    .sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));
}

export async function notesPageCount() {
  return pageCount((await visibleNotes()).length, NOTES_PER_PAGE);
}

function pageHref(page: number) {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

export async function NoteArticle({
  slug,
  note,
  standalone = false,
}: {
  slug: string;
  note: Note;
  standalone?: boolean;
}) {
  const { node } = await note.content();
  const errors = Markdoc.validate(node);
  if (errors.length) throw new Error(`Invalid content in note ${slug}`);
  const renderable = applyFootnotes(
    Markdoc.transform(node, markdocConfig(standalone ? 1 : 2)),
    `${slug}-`,
  );

  return (
    <article className="prose dark:prose-invert prose-h1:text-3xl prose-h1:font-normal prose-h1:mb-1 prose-h2:text-2xl prose-h2:mb-1">
      {standalone ? (
        <h1>{note.title}</h1>
      ) : (
        <h2>
          <Link href={`/blog/${slug}`} className="no-underline">
            {note.title}
          </Link>
        </h2>
      )}
      <time className="block text-sm text-gray-500 mb-4" dateTime={note.date}>
        {new Date(note.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
      {Markdoc.renderers.react(renderable, React)}
    </article>
  );
}

export async function NotesFeed({ page }: { page: number }) {
  const notes = await visibleNotes();
  const pages = pageCount(notes.length, NOTES_PER_PAGE);

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <h1 className="mb-8 text-2xl font-semibold">Blog</h1>
      <div className="space-y-12">
        {pageItems(notes, page, NOTES_PER_PAGE).map((note) => (
          <NoteArticle key={note.slug} slug={note.slug} note={note.entry} />
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
