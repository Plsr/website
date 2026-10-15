import { createReader } from "@keystatic/core/reader";
import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import keystaticConfig from "@/keystatic.config";
import { applyFootnotes } from "@/lib/footnotes";

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

  const { node } = await entry.content();
  const errors = Markdoc.validate(node);
  if (errors.length) throw new Error("Invalid content");

  const renderable = applyFootnotes(Markdoc.transform(node, markdocConfig));

  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <article className="prose dark:prose-invert prose-h1:text-3xl prose-h1:font-normal prose-h1:mb-1 prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg">
        <h1>{entry.title}</h1>
        <time
          className="mb-8 block text-sm text-gray-500"
          dateTime={entry.date}
        >
          {formattedDate}
        </time>
        {Markdoc.renderers.react(renderable, React)}
      </article>
    </main>
  );
}
