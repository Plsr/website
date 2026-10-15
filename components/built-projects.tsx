import { createReader } from "@keystatic/core/reader";
import {
  caseStudyHref,
  projects,
  type Project,
} from "@/content/projects";
import { RuledList, RuledRow } from "@/components/ruled-list";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export async function BuiltProjects() {
  const caseStudySlugs = new Set(await reader.collections.caseStudies.list());

  return (
    <section aria-labelledby="things-ive-built" className="mb-16">
      <h2 id="things-ive-built" className="mb-4 text-xl font-semibold">
        Things I&rsquo;ve built
      </h2>
      <RuledList ordered>
        {projects.map((project, index) => (
          <ProjectRow
            key={project.name}
            project={project}
            index={index}
            caseStudySlugs={caseStudySlugs}
          />
        ))}
      </RuledList>
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

  return (
    <RuledRow
      marker={String(index + 1).padStart(2, "0")}
      title={project.name}
      description={project.description}
      meta={project.company}
      href={href}
    />
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
