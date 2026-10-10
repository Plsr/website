import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";
import { BookRating } from "@/components/book-rating";

const reader = createReader(process.cwd(), keystaticConfig);

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Books",
  description: "Books Chris Jarling has read, is reading, or gave up on.",
};

type Book = Awaited<ReturnType<typeof reader.collections.books.all>>[number];

export default async function BooksIndex() {
  const books = (await reader.collections.books.all()).filter(
    (book) => !book.entry.hidden,
  );

  const reading = books.filter((book) => book.entry.status === "reading");
  const finished = books
    .filter((book) => book.entry.status !== "reading")
    .sort((a, b) => (a.entry.finished ?? "").localeCompare(b.entry.finished ?? ""))
    .reverse();

  const byYear = new Map<string, Book[]>();
  for (const book of finished) {
    const year = book.entry.finished?.slice(0, 4) ?? "Earlier";
    byYear.set(year, [...(byYear.get(year) ?? []), book]);
  }

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <h1 className="mb-4 text-3xl font-normal">Books</h1>
      <p className="mb-16 text-foreground/70">
        What I&rsquo;m reading and what I&rsquo;ve read, with the occasional
        note on what stuck.
      </p>

      {reading.length > 0 && (
        <BookSection label="Currently reading" books={reading} />
      )}
      {[...byYear].map(([year, yearBooks]) => (
        <BookSection key={year} label={year} books={yearBooks} />
      ))}
    </main>
  );
}

function BookSection({ label, books }: { label: string; books: Book[] }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-xl">{label}</h2>
      <ul className="space-y-2">
        {books.map((book) => (
          <li
            key={book.slug}
            className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4"
          >
            <Link
              href={`/books/${book.slug}`}
              className={`min-w-0 ${
                book.entry.status === "abandoned" ? "text-foreground/50" : ""
              }`}
            >
              {book.entry.title}
              <span className="opacity-60"> — {book.entry.author}</span>
            </Link>
            <span className="text-sm sm:ml-auto sm:shrink-0">
              {book.entry.status === "abandoned" ? (
                <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
                  Abandoned
                </span>
              ) : (
                <BookRating rating={book.entry.rating} />
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
