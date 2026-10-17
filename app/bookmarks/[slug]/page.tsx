import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookmarkBackLink, BookmarkEntry } from "@/components/bookmark-entry";
import { RuledList } from "@/components/ruled-list";
import {
  bookmarkDescription,
  isVisibleBookmark,
  listBookmarkSlugs,
  readBookmark,
  renderBookmarkNotes,
} from "@/lib/bookmarks";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await listBookmarkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await readBookmark(slug);
  if (!entry || !isVisibleBookmark(entry)) return { title: "Not found" };

  const description = await bookmarkDescription(entry);
  return {
    title: entry.title,
    description,
    openGraph: {
      title: entry.title,
      description,
    },
  };
}

export default async function BookmarkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readBookmark(slug);
  if (!entry || !isVisibleBookmark(entry)) notFound();

  const renderable = await renderBookmarkNotes(slug, entry);

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <BookmarkBackLink />
      <RuledList>
        <BookmarkEntry
          slug={slug}
          title={entry.title}
          url={entry.url}
          source={entry.source}
          renderable={renderable}
        />
      </RuledList>
    </main>
  );
}
