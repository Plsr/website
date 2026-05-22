import { createReader } from "@keystatic/core/reader";
import Markdoc, { nodes, Tag, type Node, type Config } from "@markdoc/markdoc";
import React from "react";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";

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

  const renderable = Markdoc.transform(node, markdocConfig);

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-prose px-6 py-24">
      <article className="prose dark:prose-invert prose-h1:text-3xl prose-h1:font-normal prose-h1:mb-1 prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg">
        <h1>{post.title}</h1>
        <time className="block text-sm text-gray-500 mb-8" dateTime={post.date}>
          {formattedDate}
        </time>
        {Markdoc.renderers.react(renderable, React)}
      </article>
    </main>
  );
}
