import Markdoc, { Tag } from "@markdoc/markdoc";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { TableOfContents } from "@/components/table-of-contents";
import {
  applyArticleOutline,
  claimHeadingId,
  countArticleWords,
  readingTimeLabel,
  readingTimeMinutes,
  slugifyHeading,
  WORDS_PER_MINUTE,
} from "@/lib/article-outline";
import { applyFootnotes } from "@/lib/footnotes";
import { postMarkdocConfig } from "@/lib/post-markdoc";
import {
  activeHeadingId,
  nestHeadings,
  shouldShowTableOfContents,
  type TocHeading,
} from "@/lib/toc";

function outlineMarkdown(source: string) {
  const transformed = Markdoc.transform(Markdoc.parse(source), postMarkdocConfig);
  return applyArticleOutline(applyFootnotes(transformed));
}

test("extracts rendered h2 and h3 headings in order and ignores the rest", () => {
  const { headings } = outlineMarkdown(`
# Kept

## Nested section

### Too deep

#### Also skipped

Not a heading
`);

  expect(headings).toEqual([
    { id: "kept", text: "Kept", level: 2 },
    { id: "nested-section", text: "Nested section", level: 3 },
  ]);
});

test("heading labels are plain text when the heading has inline formatting", () => {
  const { headings, tree } = outlineMarkdown(
    "## Quick intro to the `<circle>` element",
  );

  expect(headings).toEqual([
    {
      id: "quick-intro-to-the-circle-element",
      text: "Quick intro to the <circle> element",
      level: 3,
    },
  ]);

  const heading = findTag(tree, "h3");
  expect(heading?.attributes.id).toBe("quick-intro-to-the-circle-element");
  expect(heading?.children.some((child) => Tag.isTag(child) && child.name === "code")).toBe(
    true,
  );
});

test("shows a table of contents at three eligible headings and hides it below that", () => {
  const two = outlineMarkdown(`
## One

## Two
`).headings;
  const three = outlineMarkdown(`
# One

## Two

# Three
`).headings;
  const withSkippedLevel = outlineMarkdown(`
## One

### Not eligible

## Two

#### Not eligible
`).headings;

  expect(two).toHaveLength(2);
  expect(shouldShowTableOfContents(two)).toBe(false);
  expect(three).toHaveLength(3);
  expect(shouldShowTableOfContents(three)).toBe(true);
  expect(withSkippedLevel).toHaveLength(2);
  expect(shouldShowTableOfContents(withSkippedLevel)).toBe(false);
  expect(shouldShowTableOfContents([])).toBe(false);
});

test("nests h3 entries under the preceding h2 and leaves leading h3s at the root", () => {
  const headings: TocHeading[] = [
    { id: "early", text: "Early", level: 3 },
    { id: "section", text: "Section", level: 2 },
    { id: "child", text: "Child", level: 3 },
    { id: "next", text: "Next", level: 2 },
    { id: "other", text: "Other", level: 3 },
  ];

  expect(nestHeadings(headings)).toEqual([
    { id: "early", text: "Early", level: 3, children: [] },
    {
      id: "section",
      text: "Section",
      level: 2,
      children: [{ id: "child", text: "Child", level: 3, children: [] }],
    },
    {
      id: "next",
      text: "Next",
      level: 2,
      children: [{ id: "other", text: "Other", level: 3, children: [] }],
    },
  ]);
});

test("slugifies heading text into stable letter-leading anchors", () => {
  expect(slugifyHeading("Hello, World!")).toBe("hello-world");
  expect(slugifyHeading("Encoding the #")).toBe("encoding-the");
  expect(slugifyHeading("  Don't   stop  ")).toBe("dont-stop");
  expect(slugifyHeading("naïve café")).toBe("naive-cafe");
  expect(slugifyHeading("2023 in review")).toBe("section-2023-in-review");
  expect(slugifyHeading("...")).toBe("section");
  expect(slugifyHeading("")).toBe("section");
});

test("preserves an existing heading id and suffixes duplicate headings", () => {
  const { headings } = outlineMarkdown(`
## The plan {% #custom-id %}

## The plan

## The **plan**

# Intro {% #custom-id %}

## Encoding the \`#\`
`);

  expect(headings.map((heading) => heading.id)).toEqual([
    "custom-id",
    "the-plan",
    "the-plan-2",
    "custom-id-2",
    "encoding-the",
  ]);
  expect(headings.map((heading) => heading.text)).toEqual([
    "The plan",
    "The plan",
    "The plan",
    "Intro",
    "Encoding the #",
  ]);
});

test("claimHeadingId keeps the first id and skips suffixes that are already taken", () => {
  const used = new Set<string>();
  expect(claimHeadingId("intro", used)).toBe("intro");
  expect(claimHeadingId("intro-2", used)).toBe("intro-2");
  expect(claimHeadingId("intro", used)).toBe("intro-3");
  expect(claimHeadingId("   ", used)).toBe("section");
});

test("counts prose words and ignores code blocks, with inline code included", () => {
  const tree = new Tag("article", {}, [
    new Tag("p", {}, ["one two three four"]),
    new Tag("pre", { "data-language": "ts" }, ["five six seven eight nine\n"]),
    new Tag("p", {}, ["ten ", new Tag("code", {}, ["eleven"]), " twelve"]),
  ]);

  expect(countArticleWords(tree)).toBe(7);
});

test("reading time uses 200 words per minute, rounds up, and is at least one minute", () => {
  expect(WORDS_PER_MINUTE).toBe(200);
  expect(readingTimeMinutes(0)).toBe(1);
  expect(readingTimeMinutes(1)).toBe(1);
  expect(readingTimeMinutes(200)).toBe(1);
  expect(readingTimeMinutes(201)).toBe(2);
  expect(readingTimeMinutes(400)).toBe(2);
  expect(readingTimeMinutes(401)).toBe(3);
  expect(readingTimeLabel(1)).toBe("About 1 min read");
  expect(readingTimeLabel(6)).toBe("About 6 min read");

  const { tree } = outlineMarkdown(`
Two words.

\`\`\`ts
these fence words do not count at all
\`\`\`

[^1]

[^1]: Note text.
`);

  expect(countArticleWords(tree)).toBe(4);
  expect(readingTimeMinutes(countArticleWords(tree))).toBe(1);
});

test("active section is the latest heading past the offset, else the first, else the last at the end", () => {
  const positions = [
    { id: "a", top: 400 },
    { id: "b", top: 300 },
    { id: "c", top: 200 },
  ];

  expect(activeHeadingId([], 96, false)).toBeNull();
  expect(activeHeadingId(positions, 96, false)).toBe("a");
  expect(activeHeadingId([{ id: "a", top: 96 }], 96, false)).toBe("a");
  expect(
    activeHeadingId(
      [
        { id: "a", top: 40 },
        { id: "b", top: 96 },
        { id: "c", top: 180 },
      ],
      96,
      false,
    ),
  ).toBe("b");
  expect(activeHeadingId(positions, 96, true)).toBe("c");
});

test("server markup is a labeled list of real links with the first section current", () => {
  const html = renderToStaticMarkup(
    createElement(TableOfContents, {
      items: [
        {
          id: "the-plan",
          text: "The plan",
          level: 2,
          children: [
            {
              id: "details",
              text: "Details & notes",
              level: 3,
              children: [],
            },
          ],
        },
        { id: "custom-id", text: "Custom", level: 2, children: [] },
      ],
    }),
  );

  expect(html).toContain('aria-label="Table of contents"');
  expect(html).toContain('href="#the-plan"');
  expect(html).toContain('href="#details"');
  expect(html).toContain('href="#custom-id"');
  expect(html).toContain('aria-current="location"');
  expect(html.match(/aria-current="location"/g)).toHaveLength(1);
  expect(html).toContain("Details &amp; notes");
  expect(html.indexOf("the-plan")).toBeLessThan(html.indexOf("details"));
  const lists = html.match(/<ol/g) ?? [];
  expect(lists).toHaveLength(2);
});

function findTag(node: unknown, name: string): Tag | null {
  if (!Tag.isTag(node)) return null;
  if (node.name === name) return node;
  for (const child of node.children) {
    const found = findTag(child, name);
    if (found) return found;
  }
  return null;
}
