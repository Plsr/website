import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { Callout } from "./callout";
import { Figure } from "./figure";
import type { CaseStudyComponentName } from "./options";

/**
 * Components an author can use in case-study MDX.
 *
 * To add one:
 * 1. Add its name to `caseStudyComponentNames` in `options.ts`.
 * 2. Create the component and add it here.
 * 3. Register a Keystatic content component with the same name in
 *    `keystatic.ts` so the admin can insert it.
 * Both records are typed against that name list, so skipping a step
 * fails typecheck.
 */
export const caseStudyComponents = {
  Figure,
  Callout,
} satisfies Record<CaseStudyComponentName, MDXComponents[string]>;

/**
 * Posts render a Markdoc `#` as an `h2` because the page title is already
 * the `h1`. Shift case-study headings the same way so the type scale matches.
 */
function shiftedHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${Math.min(level + 1, 6)}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return function Heading(props: ComponentPropsWithoutRef<typeof Tag>) {
    return <Tag {...props} />;
  };
}

export const caseStudyMdxComponents = {
  ...caseStudyComponents,
  h1: shiftedHeading(1),
  h2: shiftedHeading(2),
  h3: shiftedHeading(3),
  h4: shiftedHeading(4),
  h5: shiftedHeading(5),
  h6: shiftedHeading(6),
} satisfies MDXComponents;
