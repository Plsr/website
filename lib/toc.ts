/** A rendered h2 or h3 that can appear in the table of contents. */
export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type TocItem = TocHeading & {
  children: TocItem[];
};

/** Show a table of contents only when a post has at least this many eligible headings. */
export const MIN_TOC_HEADINGS = 3;

export function shouldShowTableOfContents(headings: readonly TocHeading[]): boolean {
  return headings.length >= MIN_TOC_HEADINGS;
}

/**
 * Nest each h3 under the preceding h2. An h3 with no preceding h2 stays at the
 * root so it remains reachable, and the next h2 starts a new group.
 */
export function nestHeadings(headings: readonly TocHeading[]): TocItem[] {
  const tree: TocItem[] = [];
  let currentSection: TocItem | null = null;

  for (const heading of headings) {
    const item: TocItem = { ...heading, children: [] };
    if (heading.level === 3 && currentSection) {
      currentSection.children.push(item);
      continue;
    }
    tree.push(item);
    currentSection = heading.level === 2 ? item : null;
  }

  return tree;
}

export function flattenToc(items: readonly TocItem[]): TocItem[] {
  const flat: TocItem[] = [];
  for (const item of items) {
    flat.push(item);
    flat.push(...flattenToc(item.children));
  }
  return flat;
}

export type HeadingPosition = {
  id: string;
  /** Distance in pixels from the top of the viewport to the heading. */
  top: number;
};

/**
 * Latest eligible heading whose top has crossed the reading offset.
 * Before any heading has crossed, the first one is current. At the end of
 * the article the last one is current, including when the final heading can
 * no longer reach the offset.
 */
export function activeHeadingId(
  positions: readonly HeadingPosition[],
  offset: number,
  atArticleEnd: boolean,
): string | null {
  if (positions.length === 0) return null;
  if (atArticleEnd) return positions[positions.length - 1].id;

  let current = positions[0].id;
  for (const heading of positions) {
    if (heading.top <= offset) current = heading.id;
  }
  return current;
}
