import { createReader } from "@keystatic/core/reader";
import Markdoc from "@markdoc/markdoc";
import React from "react";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

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

  const renderable = Markdoc.transform(node);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="prose lg:prose-lg dark:prose-invert">
        <h1>{post.title}</h1>
        {Markdoc.renderers.react(renderable, React)}
      </article>
    </main>
  );
}
