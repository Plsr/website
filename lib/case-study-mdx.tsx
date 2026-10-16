import { evaluate, type EvaluateOptions } from "@mdx-js/mdx";
import type { MDXContent } from "mdx/types";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { caseStudyMdxComponents } from "@/components/case-study/registry";

const evaluateOptions = {
  Fragment,
  jsx,
  jsxs,
  remarkPlugins: [remarkGfm],
} satisfies EvaluateOptions;

/**
 * Compile a case-study MDX body. Keystatic's reader returns the document
 * with frontmatter already removed, and components are supplied here rather
 * than imported inside the file.
 */
export async function CaseStudyMdx({ source }: { source: string }) {
  let Content: MDXContent;

  try {
    ({ default: Content } = await evaluate(source, evaluateOptions));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not render case study MDX: ${message}`);
  }

  return <Content components={caseStudyMdxComponents} />;
}
