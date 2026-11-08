import { createReader } from "@keystatic/core/reader";
import Markdoc from "@markdoc/markdoc";
import React from "react";
import type { Metadata } from "next";
import { TableOfContents } from "@/components/table-of-contents";
import keystaticConfig from "@/keystatic.config";
import {
  applyArticleOutline,
  countArticleWords,
  readingTimeLabel,
  readingTimeMinutes,
} from "@/lib/article-outline";
import { applyFootnotes } from "@/lib/footnotes";
import { postMarkdocConfig } from "@/lib/post-markdoc";
import { proseClassName } from "@/lib/prose";
import { nestHeadings, shouldShowTableOfContents } from "@/lib/toc";

const reader = createReader(process.cwd(), keystaticConfig);

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await reader.collections.posts.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await reader.collections.posts.read(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description || undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description || undefined,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await reader.collections.posts.read(slug);
  if (!post) return <main>No post found.</main>;

  const { node } = await post.content();
  const errors = Markdoc.validate(node);
  if (errors.length) throw new Error("Invalid content");

  const { tree, headings } = applyArticleOutline(
    applyFootnotes(Markdoc.transform(node, postMarkdocConfig)),
  );
  const showToc = shouldShowTableOfContents(headings);
  const readingTime = readingTimeLabel(readingTimeMinutes(countArticleWords(tree)));

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative mx-auto w-full max-w-prose px-6 py-24">
      {showToc ? (
        <div className="absolute inset-y-24 right-[calc(100%+1.5rem)] hidden w-56 xl:block">
          <TableOfContents items={nestHeadings(headings)} />
        </div>
      ) : null}
      <article data-article className={proseClassName}>
        <h1>{post.title}</h1>
        <div className="mb-8">
          <time className="block text-sm text-gray-500" dateTime={post.date}>
            {formattedDate}
          </time>
          <p data-reading-time className="not-prose mt-1 mb-0 text-sm text-gray-500">
            {readingTime}
          </p>
        </div>
        {Markdoc.renderers.react(tree, React)}
        {post.tags.length > 0 && (
          <ul className="not-prose mt-12 flex list-none flex-wrap gap-2 p-0">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-gray-300 px-2.5 py-0.5 text-xs text-gray-500 dark:border-gray-700"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </article>
    </main>
  );
}
