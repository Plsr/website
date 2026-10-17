import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import Link from "next/link";
import React, { type ReactNode } from "react";
import { RuledRow } from "@/components/ruled-list";

// Markdown headings are already demoted one level. Keep them smaller than
// post headings so a section inside the notes doesn't outweigh the row title.
const notesClassName =
  "prose dark:prose-invert prose-h1:text-xl prose-h1:font-normal prose-h1:mb-1 prose-h2:text-lg prose-h3:text-base prose-h4:text-sm max-w-none break-words";

const secondaryLinkClassName =
  "text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100";

export function BookmarkEntry({
  slug,
  title,
  url,
  source,
  renderable,
  showPermalink = false,
}: {
  slug: string;
  title: string;
  url: string;
  source: string;
  renderable: RenderableTreeNode | null;
  showPermalink?: boolean;
}) {
  const notes =
    renderable == null ? null : (
      <div className={notesClassName}>
        {Markdoc.renderers.react(renderable, React)}
      </div>
    );
  const permalink = showPermalink ? (
    <p className="mt-3 pb-4">
      <Link
        href={`/bookmarks/${slug}`}
        className={secondaryLinkClassName}
        aria-label={`Permalink to ${title}`}
      >
        permalink
      </Link>
    </p>
  ) : null;

  return (
    <RuledRow title={title} meta={source || undefined} href={url} external>
      {notes == null && permalink == null ? null : (
        <>
          {notes}
          {permalink}
        </>
      )}
    </RuledRow>
  );
}

export function BookmarkBackLink(): ReactNode {
  return (
    <p className="mb-8">
      <Link href="/bookmarks" className={secondaryLinkClassName}>
        ← Bookmarks
      </Link>
    </p>
  );
}
