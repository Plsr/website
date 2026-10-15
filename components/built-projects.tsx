import { createReader } from "@keystatic/core/reader";
import Link from "next/link";
import {
  caseStudyHref,
  projects,
  type Project,
} from "@/content/projects";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export async function BuiltProjects() {
  const caseStudySlugs = new Set(await reader.collections.caseStudies.list());

  return (
    <section aria-labelledby="things-ive-built" className="mb-16">
      <h2 id="things-ive-built" className="mb-4 text-xl font-semibold">
        Things I&rsquo;ve built
      </h2>
      <ol className="list-none border-t border-surface-border">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.name}
            project={project}
            index={index}
            caseStudySlugs={caseStudySlugs}
          />
        ))}
      </ol>
    </section>
  );
}

function ProjectRow({
  project,
  index,
  caseStudySlugs,
}: {
  project: Project;
  index: number;
  caseStudySlugs: Set<string>;
}) {
  const href = resolveCaseStudyHref(project, caseStudySlugs);
  const className = "flex items-baseline gap-x-3 py-3 sm:gap-x-4 sm:py-3.5";
  const content = (
    <>
      <span
        aria-hidden="true"
        className="w-6 shrink-0 font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="min-w-0 flex-1 text-pretty leading-snug">
        <span className="font-bold">{project.name}</span>{" "}
        <em className="italic">{project.description}</em>
      </p>
      <span className="shrink-0 text-gray-500">{project.company}</span>
    </>
  );

  return (
    <li className="border-b border-surface-border">
      {href ? (
        <Link
          href={href}
          className={`${className} transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900`}
        >
          {content}
        </Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}

function resolveCaseStudyHref(project: Project, caseStudySlugs: Set<string>) {
  if (!project.caseStudy) return undefined;

  if (!caseStudySlugs.has(project.caseStudy)) {
    throw new Error(
      `Project "${project.name}" references case study "${project.caseStudy}", but content/case-studies/${project.caseStudy}.mdoc does not exist.`,
    );
  }

  return caseStudyHref(project.caseStudy);
}
