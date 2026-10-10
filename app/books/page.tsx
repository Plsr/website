import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";
import { BookCover } from "@/components/book-cover";
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
        <section className="mb-20">
          <SectionHeading label="Currently reading" />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {reading.map((book) => (
              <li key={book.slug}>
                <Link
                  href={`/books/${book.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-none dark:hover:bg-zinc-900/60"
                >
                  <BookCover
                    slug={book.slug}
                    title={book.entry.title}
                    author={book.entry.author}
                    cover={book.entry.cover}
                    sizes="64px"
                    className="w-16 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg leading-snug text-balance">
                      {book.entry.title}
                    </h3>
                    <p className="text-sm text-gray-500">{book.entry.author}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {[...byYear].map(([year, yearBooks]) => (
        <section key={year} className="mb-16">
          <SectionHeading
            label={year}
            count={`${yearBooks.length} ${yearBooks.length === 1 ? "book" : "books"}`}
          />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {yearBooks.map((book) => (
              <li key={book.slug}>
                <Link href={`/books/${book.slug}`} className="group block">
                  <BookCover
                    slug={book.slug}
                    title={book.entry.title}
                    author={book.entry.author}
                    cover={book.entry.cover}
                    sizes="(min-width: 640px) 200px, 45vw"
                    className={`transition-transform duration-200 group-hover:-translate-y-1 ${
                      book.entry.status === "abandoned"
                        ? "opacity-50 grayscale"
                        : ""
                    }`}
                  />
                  <h3 className="mt-3 font-serif leading-snug text-balance">
                    {book.entry.title}
                  </h3>
                  <p className="text-sm text-gray-500">{book.entry.author}</p>
                  <p className="mt-1 text-sm">
                    {book.entry.status === "abandoned" ? (
                      <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
                        Abandoned
                      </span>
                    ) : (
                      <BookRating rating={book.entry.rating} />
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

function SectionHeading({ label, count }: { label: string; count?: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-b border-surface-border pb-2">
      <h2 className="text-xl">{label}</h2>
      {count && (
        <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
          {count}
        </span>
      )}
    </div>
  );
}
