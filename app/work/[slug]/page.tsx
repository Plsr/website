import { createReader } from "@keystatic/core/reader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import keystaticConfig from "@/keystatic.config";
import { CaseStudyMdx } from "@/lib/case-study-mdx";
import { proseClassName } from "@/lib/prose";

const reader = createReader(process.cwd(), keystaticConfig);

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await reader.collections.caseStudies.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await reader.collections.caseStudies.read(slug);
  if (!entry) return { title: "Not found" };
  return {
    title: entry.title,
    description: entry.description || undefined,
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.description || undefined,
      publishedTime: entry.date,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await reader.collections.caseStudies.read(slug);
  if (!entry) notFound();

  const source = await entry.content();

  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="overflow-x-clip">
      <main className="mx-auto w-full max-w-prose px-6 py-24">
        <article className={proseClassName}>
          <h1>{entry.title}</h1>
          <time
            className="mb-8 block text-sm text-gray-500"
            dateTime={entry.date}
          >
            {formattedDate}
          </time>
          <CaseStudyMdx source={source} />
        </article>
      </main>
    </div>
  );
}
