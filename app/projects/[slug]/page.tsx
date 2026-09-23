import { createReader } from "@keystatic/core/reader";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import keystaticConfig from "@/keystatic.config";
import { renderMarkdoc } from "@/lib/markdoc";

const reader = createReader(process.cwd(), keystaticConfig);

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await reader.collections.projects.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);
  if (!project) return { title: "Not found" };
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await reader.collections.projects.read(slug);
  if (!project) notFound();

  const { node } = await project.content();

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <article className="prose dark:prose-invert prose-h1:text-3xl prose-h1:font-normal prose-h1:mb-1 prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg">
        <h1>{project.title}</h1>
        <p className="lead text-gray-500">{project.description}</p>
        <Image
          src={project.image}
          alt=""
          width={800}
          height={500}
          className="rounded-xl border border-surface-border"
          priority
        />
        {renderMarkdoc(node)}
        <p>
          <Link href="/">← Back home</Link>
        </p>
      </article>
    </main>
  );
}
