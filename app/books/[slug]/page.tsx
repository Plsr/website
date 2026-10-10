import { createReader } from "@keystatic/core/reader";
import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";
import { applyFootnotes } from "@/lib/footnotes";
import { BookCover } from "@/components/book-cover";
import { BookRating } from "@/components/book-rating";

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

const STATUS_LABELS = {
  reading: "Currently reading",
  read: "Finished",
  abandoned: "Abandoned",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await reader.collections.books.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await reader.collections.books.read(slug);
  if (!book) return { title: "Not found" };
  return {
    title: `${book.title} by ${book.author}`,
    description: `Chris Jarling's notes on ${book.title} by ${book.author}.`,
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await reader.collections.books.read(slug);
  if (!book) return <main>No book found.</main>;

  const { node } = await book.notes();
  const errors = Markdoc.validate(node);
  if (errors.length) throw new Error("Invalid content");

  const renderable = applyFootnotes(Markdoc.transform(node, markdocConfig));
  const hasNotes = node.children.length > 0;

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <Link
        href="/books"
        className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
      >
        ← All books
      </Link>

      <header className="mt-8 mb-12 flex flex-col gap-6 sm:flex-row sm:items-end">
        <BookCover
          slug={slug}
          title={book.title}
          author={book.author}
          cover={book.cover}
          sizes="160px"
          className="w-40 shrink-0"
        />
        <div>
          <h1 className="text-3xl font-normal leading-tight text-balance">
            {book.title}
          </h1>
          <p className="mt-1 text-foreground/70">{book.author}</p>
          <dl className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="sr-only">Status</dt>
              <dd className="font-mono text-xs uppercase tracking-wide text-gray-500">
                {STATUS_LABELS[book.status]}
                {book.finished &&
                  ` · ${new Date(book.finished).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}`}
              </dd>
            </div>
            {book.rating && (
              <div>
                <dt className="sr-only">Rating</dt>
                <dd>
                  <BookRating rating={book.rating} />
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      {hasNotes ? (
        <article className="prose dark:prose-invert prose-h2:text-2xl prose-h3:text-xl">
          {Markdoc.renderers.react(renderable, React)}
        </article>
      ) : (
        <p className="text-gray-500 italic">No notes on this one (yet).</p>
      )}
    </main>
  );
}
