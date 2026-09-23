import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, projects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return { title: project.name, description: project.description };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto w-full max-w-prose px-6 py-24">
      <article className="prose dark:prose-invert prose-h1:text-3xl prose-h1:font-normal prose-h1:mb-1">
        <h1>{project.name}</h1>
        <p className="lead text-gray-500">{project.description}</p>
        <Image
          src={project.image}
          alt=""
          width={800}
          height={500}
          className="rounded-xl border border-surface-border"
          priority
        />
        {project.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
        <p>
          <Link href="/">← Back home</Link>
        </p>
      </article>
    </main>
  );
}
