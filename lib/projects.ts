export type Project = {
  slug: string;
  name: string;
  description: string;
  image: string;
  body: string[];
};

// Placeholder content — replace with real projects.
export const projects: Project[] = [1, 2, 3].map((n) => ({
  slug: `project-${n}`,
  name: `Project ${n}`,
  description: "A short placeholder description of what this project is about.",
  image: `/images/projects/placeholder-${n}.svg`,
  body: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  ],
}));

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
