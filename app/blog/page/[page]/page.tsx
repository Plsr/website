import type { Metadata } from "next";
import { NotesFeed, pageCount } from "../../notes-feed";

export const dynamicParams = false;

// Page 1 lives at /blog, so only later pages are generated here.
export async function generateStaticParams() {
  const total = await pageCount();
  return Array.from({ length: total - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Blog – Page ${page}`,
    description: "Short life updates by Chris Jarling.",
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  return <NotesFeed page={Number(page)} />;
}
