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
  external = false,
  children,
}: {
  marker?: ReactNode;
  title: string;
  description?: string;
  meta?: string;
  dateTime?: string;
  href?: string;
  // External rows link the title only, so notes can sit under the row
  // without living inside the anchor. Homepage rows leave this unset.
  external?: boolean;
  children?: ReactNode;
}) {
  if (external || children != null) {
    return (
      <ExtendedRow
        marker={marker}
        title={title}
        description={description}
        meta={meta}
        dateTime={dateTime}
        href={href}
        external={external}
      >
        {children}
      </ExtendedRow>
    );
  }

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

function ExtendedRow({
  marker,
  title,
  description,
  meta,
  dateTime,
  href,
  external,
  children,
}: {
  marker?: ReactNode;
  title: string;
  description?: string;
  meta?: string;
  dateTime?: string;
  href?: string;
  external: boolean;
  children?: ReactNode;
}) {
  const hasBody = children != null && children !== false;
  const headerClassName = hasBody
    ? "flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-3 pb-2 sm:gap-x-4 sm:pt-3.5"
    : `${rowClassName} flex-wrap gap-y-1`;
  const titleClassName =
    "break-words font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  const titleNode =
    href && external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${titleClassName} underline decoration-zinc-300 underline-offset-4 hover:decoration-foreground dark:decoration-zinc-600`}
      >
        {title}
      </a>
    ) : href ? (
      <Link href={href} className={`${titleClassName} hover:underline`}>
        {title}
      </Link>
    ) : (
      <span className="break-words font-bold">{title}</span>
    );

  const metaClassName =
    "min-w-0 max-w-full break-words text-gray-500 max-sm:basis-full sm:shrink-0";

  return (
    <li className="border-b border-surface-border">
      <div className={headerClassName}>
        {marker != null ? (
          <span
            aria-hidden="true"
            className="w-6 shrink-0 font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500"
          >
            {marker}
          </span>
        ) : null}
        <p className="min-w-0 flex-1 basis-full text-pretty leading-snug sm:basis-auto">
          {titleNode}
          {description ? (
            <>
              {" "}
              <em className="italic">{description}</em>
            </>
          ) : null}
        </p>
        {meta ? (
          dateTime ? (
            <time className={metaClassName} dateTime={dateTime}>
              {meta}
            </time>
          ) : (
            <span className={metaClassName}>{meta}</span>
          )
        ) : null}
      </div>
      {hasBody ? <div>{children}</div> : null}
    </li>
  );
}
