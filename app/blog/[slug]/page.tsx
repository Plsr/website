import type { Metadata } from "next";
import { NoteArticle, reader } from "../notes-feed";

export const dynamicParams = false;

export async function generateStaticParams() {
  const notes = await reader.collections.notes.all();
  return notes
    .filter((note) => !note.entry.hidden)
    .map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await reader.collections.notes.read(slug);
  if (!note) return { title: "Not found" };
  return {
    title: note.title,
    openGraph: {
      type: "article",
      title: note.title,
      publishedTime: note.date,
    },
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await reader.collections.notes.read(slug);
  if (!note) return <main>No note found.</main>;

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <NoteArticle slug={slug} note={note} standalone />
    </main>
  );
}
