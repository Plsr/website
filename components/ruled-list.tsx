import Link from "next/link";
import type { ReactNode } from "react";

const rowClassName = "flex items-baseline gap-x-3 py-3 sm:gap-x-4 sm:py-3.5";

const linkedRowClassName = `${rowClassName} transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:hover:bg-zinc-900 dark:focus-visible:bg-zinc-900`;

export function RuledList({
  children,
  className,
  ordered = false,
}: {
  children: ReactNode;
  className?: string;
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={["list-none border-t border-surface-border", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

export function RuledRow({
  marker,
  title,
  description,
  meta,
  dateTime,
  href,
}: {
  marker?: ReactNode;
  title: string;
  description?: string;
  meta: string;
  dateTime?: string;
  href?: string;
}) {
  const metaClassName = dateTime
    ? "shrink-0 tabular-nums text-gray-500"
    : "shrink-0 text-gray-500";
  const content = (
    <>
      {marker != null ? (
        <span
          aria-hidden="true"
          className="w-6 shrink-0 font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500"
        >
          {marker}
        </span>
      ) : null}
      <p className="min-w-0 flex-1 text-pretty leading-snug">
        <span className="font-bold">{title}</span>
        {description ? (
          <>
            {" "}
            <em className="italic">{description}</em>
          </>
        ) : null}
      </p>
      {dateTime ? (
        <time className={metaClassName} dateTime={dateTime}>
          {meta}
        </time>
      ) : (
        <span className={metaClassName}>{meta}</span>
      )}
    </>
  );

  return (
    <li className="border-b border-surface-border">
      {href ? (
        <Link href={href} className={linkedRowClassName}>
          {content}
        </Link>
      ) : (
        <div className={rowClassName}>{content}</div>
      )}
    </li>
  );
}
