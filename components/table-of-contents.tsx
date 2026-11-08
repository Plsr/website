"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { activeHeadingId, flattenToc, type TocItem } from "@/lib/toc";

const FALLBACK_OFFSET_PX = 96;

function readingOffset(heading: HTMLElement): number {
  const margin = parseFloat(getComputedStyle(heading).scrollMarginTop);
  return Number.isFinite(margin) && margin > 0 ? margin : FALLBACK_OFFSET_PX;
}

function articleEndReached(article: HTMLElement, offset: number): boolean {
  if (article.getBoundingClientRect().bottom <= offset) return true;

  const root = document.documentElement;
  const canScroll = root.scrollHeight > window.innerHeight + 4;
  if (!canScroll) return false;
  return window.scrollY + window.innerHeight >= root.scrollHeight - 4;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const navRef = useRef<HTMLElement>(null);
  const flat = useMemo(() => flattenToc(items), [items]);
  const [activeId, setActiveId] = useState(flat[0]?.id ?? "");

  useEffect(() => {
    const elements = flat.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [element] : [];
    });
    if (elements.length === 0) return;

    const article = document.querySelector<HTMLElement>("[data-article]");
    let frame = 0;

    const update = () => {
      const offset = readingOffset(elements[0]);
      const next = activeHeadingId(
        elements.map((element) => ({
          id: element.id,
          top: element.getBoundingClientRect().top,
        })),
        offset,
        article ? articleEndReached(article, offset) : false,
      );
      if (next) setActiveId((current) => (current === next ? current : next));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [flat]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const current = nav.querySelector<HTMLElement>('[aria-current="location"]');
    if (!current) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = current.getBoundingClientRect();
    if (linkRect.top < navRect.top) {
      nav.scrollTop -= navRect.top - linkRect.top;
    } else if (linkRect.bottom > navRect.bottom) {
      nav.scrollTop += linkRect.bottom - navRect.bottom;
    }
  }, [activeId]);

  if (flat.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain pr-1"
    >
      <p className="mb-3 text-xs text-gray-500">On this page</p>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}

function TocList({
  items,
  activeId,
  nested = false,
}: {
  items: TocItem[];
  activeId: string;
  nested?: boolean;
}) {
  return (
    <ol
      className={
        nested
          ? "mt-0.5 list-none space-y-0.5 border-l border-surface-border py-0.5 pl-2"
          : "list-none space-y-0.5 p-0"
      }
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${encodeURIComponent(item.id)}`}
              aria-current={active ? "location" : undefined}
              className={`block border-l-2 py-1 pl-2.5 text-sm leading-snug break-words no-underline transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-gray-500 hover:text-foreground"
              }`}
            >
              {item.text}
            </a>
            {item.children.length > 0 ? (
              <TocList items={item.children} activeId={activeId} nested />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
