import { Tag, type RenderableTreeNode } from "@markdoc/markdoc";

const REF_PATTERN = /\[\^([^\]]+)\]/g;
const DEF_PATTERN = /^\[\^([^\]]+)\]:\s*/;

type FootnoteDef = { id: string; children: RenderableTreeNode[] };

/**
 * Markdoc has no native footnote syntax, so `[^1]` refs and `[^1]: text`
 * definitions come through as plain text. This walks the rendered tree,
 * pulls the definition paragraphs out into a footnotes section, and turns
 * refs into links pointing at them (with a back-link the other way).
 */
export function applyFootnotes(
  tree: RenderableTreeNode,
  idPrefix = "",
): RenderableTreeNode {
  if (!Tag.isTag(tree)) return tree;

  const defs: FootnoteDef[] = [];
  const withoutDefs = extractDefinitions(tree, defs);
  if (defs.length === 0) return tree;

  const defsById = new Map(defs.map((def) => [def.id, def]));
  const numbering = new Map<string, number>();
  const refCounts = new Map<string, number>();

  const [withRefs] = linkifyRefs(withoutDefs, defsById, numbering, refCounts, idPrefix);
  const root = withRefs as Tag;

  // Any definitions never referenced in the text still get a number, appended in
  // the order they were written.
  for (const def of defs) {
    if (!numbering.has(def.id)) numbering.set(def.id, numbering.size + 1);
  }

  const orderedDefs = [...defs].sort(
    (a, b) => numbering.get(a.id)! - numbering.get(b.id)!,
  );

  root.children = [
    ...root.children,
    buildFootnotesSection(orderedDefs, refCounts, idPrefix),
  ];
  return root;
}

function extractDefinitions(node: RenderableTreeNode, defs: FootnoteDef[]): RenderableTreeNode {
  if (!Tag.isTag(node)) return node;

  const children: RenderableTreeNode[] = [];
  for (const child of node.children) {
    const match = matchDefinition(child);
    if (match) {
      defs.push(match);
      continue;
    }
    children.push(extractDefinitions(child, defs));
  }

  const result = new Tag(node.name, node.attributes, children);
  return result;
}

function matchDefinition(node: RenderableTreeNode): FootnoteDef | null {
  if (!Tag.isTag(node) || node.name !== "p") return null;
  const [first, ...rest] = node.children;
  if (typeof first !== "string") return null;

  const match = first.match(DEF_PATTERN);
  if (!match) return null;

  const id = match[1];
  const remainder = first.slice(match[0].length);
  const children = remainder ? [remainder, ...rest] : rest;
  return { id, children };
}

function linkifyRefs(
  node: RenderableTreeNode,
  defsById: Map<string, FootnoteDef>,
  numbering: Map<string, number>,
  refCounts: Map<string, number>,
  idPrefix: string,
): RenderableTreeNode[] {
  if (typeof node === "string") {
    return splitRefs(node, defsById, numbering, refCounts, idPrefix);
  }
  if (!Tag.isTag(node)) return [node];

  const children: RenderableTreeNode[] = [];
  for (const child of node.children) {
    children.push(...linkifyRefs(child, defsById, numbering, refCounts, idPrefix));
  }

  return [new Tag(node.name, node.attributes, children)];
}

function splitRefs(
  text: string,
  defsById: Map<string, FootnoteDef>,
  numbering: Map<string, number>,
  refCounts: Map<string, number>,
  idPrefix: string,
): RenderableTreeNode[] {
  const parts: RenderableTreeNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(REF_PATTERN)) {
    const id = match[1];
    if (!defsById.has(id)) continue;

    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    lastIndex = index + match[0].length;

    if (!numbering.has(id)) numbering.set(id, numbering.size + 1);
    const occurrence = (refCounts.get(id) ?? 0) + 1;
    refCounts.set(id, occurrence);

    const refId =
      occurrence === 1 ? `fnref-${idPrefix}${id}` : `fnref-${idPrefix}${id}-${occurrence}`;
    parts.push(
      new Tag(
        "a",
        {
          href: `#fn-${idPrefix}${id}`,
          id: refId,
          class: "footnote-ref",
          role: "doc-noteref",
          "aria-describedby": `fn-${idPrefix}${id}`,
        },
        [String(numbering.get(id))],
      ),
    );
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

function buildFootnotesSection(
  orderedDefs: FootnoteDef[],
  refCounts: Map<string, number>,
  idPrefix: string,
): Tag {
  const items = orderedDefs.map((def) => {
    const backrefs: Tag[] = [];
    const occurrences = refCounts.get(def.id) ?? 0;
    for (let i = 1; i <= occurrences; i++) {
      const refId =
        i === 1 ? `fnref-${idPrefix}${def.id}` : `fnref-${idPrefix}${def.id}-${i}`;
      backrefs.push(
        new Tag(
          "a",
          {
            href: `#${refId}`,
            class: "footnote-backref",
            role: "doc-backlink",
            "aria-label": "Back to content",
          },
          ["↩"],
        ),
      );
    }

    return new Tag(
      "li",
      { id: `fn-${idPrefix}${def.id}` },
      [new Tag("p", {}, [...def.children, " ", ...backrefs])],
    );
  });

  return new Tag("section", { class: "footnotes", role: "doc-endnotes" }, [
    new Tag("ol", {}, items),
  ]);
}
