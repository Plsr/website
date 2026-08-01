"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, ViewTransition } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/about", label: "About" },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Close once the route has actually changed, instead of on click, so the
  // modal keeps blurring the old page until the new one is ready.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="relative">
      <div className="flex items-center justify-end px-6 py-4 md:justify-center">
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen((o) => !o)}
          className="relative z-50 md:hidden inline-flex items-center justify-center rounded-md p-2 bg-surface/80 shadow-sm ring-1 ring-surface-border backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {open ? <CloseIcon /> : <BurgerIcon />}
        </button>

        <ul className="hidden md:flex items-center gap-4">
          {links.map(({ href, label }, index) => (
            <li key={href}>
              <NavLink
                href={href}
                label={label}
                index={index}
                active={isActive(pathname, href)}
                pillName="nav-active-pill"
              />
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
          />
          <ul
            id="primary-menu"
            className="relative flex h-full flex-col items-center justify-center gap-6 text-xl"
          >
            {links.map(({ href, label }, index) => (
              <li key={href}>
                <NavLink
                  href={href}
                  label={label}
                  index={index}
                  active={isActive(pathname, href)}
                  onClick={() => {
                    if (isActive(pathname, href)) setOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  index,
  active,
  onClick,
  pillName,
}: {
  href: string;
  label: string;
  index: number;
  active: boolean;
  onClick?: () => void;
  pillName?: string;
}) {
  const pill = (
    <span
      aria-hidden
      className="absolute inset-0 -z-10 rounded-md bg-zinc-100 dark:bg-zinc-800"
    />
  );
  const slug = href === "/" ? "home" : href.replace(/[^a-z0-9]/gi, "-");
  const labelName = pillName ? `nav-label-${slug}` : undefined;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative z-0 block rounded-md px-3 py-1.5 transition-colors ${
        active
          ? "text-foreground"
          : "text-foreground/70 hover:bg-zinc-50 hover:text-foreground dark:hover:bg-zinc-900"
      }`}
    >
      {active &&
        (pillName ? (
          <ViewTransition name={pillName}>{pill}</ViewTransition>
        ) : (
          pill
        ))}
      <span
        style={labelName ? { viewTransitionName: labelName } : undefined}
        className="relative z-10 flex items-baseline gap-2"
      >
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {String(index + 1).padStart(2, "0")}
        </span>
        {label}
      </span>
    </Link>
  );
}

function BurgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
