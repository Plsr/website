import path from "node:path";
import { createReader } from "@keystatic/core/reader";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import keystaticConfig from "@/keystatic.config";
import { CaseStudyMdx } from "@/lib/case-study-mdx";

const fixtureRoot = path.join(process.cwd(), "test/fixtures");

test("renders a case study from the Keystatic reader through CaseStudyMdx", async () => {
  const reader = createReader(fixtureRoot, keystaticConfig);
  const entry = await reader.collections.caseStudies.read("smoke");
  expect(entry).not.toBeNull();
  if (!entry) {
    throw new Error("smoke case study was not found");
  }

  const source = await entry.content();
  const html = renderToStaticMarkup(await CaseStudyMdx({ source }));

  expect(html).toContain("<h2>Top heading</h2>");
  expect(html).not.toContain("<h1");
  expect(html).toContain("A caption");
  expect(html).toContain("<strong>bold</strong>");
});
