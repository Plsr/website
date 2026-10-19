import type { Metadata } from "next";
import { BookmarkEntry } from "@/components/bookmark-entry";
import { RuledList } from "@/components/ruled-list";
import {
  bookmarksDescription,
  listVisibleBookmarks,
} from "@/lib/bookmarks";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: bookmarksDescription,
};

export default async function BookmarksPage() {
  const bookmarks = await listVisibleBookmarks();

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <h1 className="mb-16 text-3xl font-normal">Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p className="text-gray-500">No bookmarks yet.</p>
      ) : (
        <RuledList>
          {bookmarks.map((bookmark) => (
            <BookmarkEntry
              key={bookmark.slug}
              slug={bookmark.slug}
              title={bookmark.entry.title}
              url={bookmark.entry.url}
              source={bookmark.entry.source}
              renderable={bookmark.renderable}
              showPermalink
            />
          ))}
        </RuledList>
      )}
    </main>
  );
}
