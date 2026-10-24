/**
 * Homepage "Things I've built" entries, in display order.
 *
 * To publish a case study and link a row:
 * 1. Add `content/case-studies/<slug>.mdx` (or create it in Keystatic).
 * 2. Set `caseStudy` to that slug (filename without `.mdx`).
 * The row then links to `/work/<slug>`. Leave `caseStudy` unset and the row
 * stays plain text.
 */
export type Project = {
  name: string;
  description: string;
  company: string;
  caseStudy?: string;
};

export const projects: Project[] = [
  {
    name: "Evergreen roaming",
    description: "roaming without installing new eSIMs.",
    company: "Gigs",
  },
  {
    name: "US number porting",
    description: "a smoother way to bring your number.",
    company: "Gigs",
  },
  {
    name: "Gigs API docs",
    description: "moved off Stoplight.",
    company: "Gigs",
  },
  {
    name: "Webex.shop",
    description: "Cisco’s Webex store.",
    company: "Cisco",
  },
  {
    name: "hystreet.com",
    description: "live visitor data for shopping streets.",
    company: "Railslove",
  },
];

export function caseStudyHref(slug: string) {
  return `/work/${slug}`;
}
