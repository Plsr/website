"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/posts", label: "Posts" },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative bg-surface border-b border-surface-border">
      <div className="flex items-center justify-between px-6 py-4 md:justify-center">
        <Link
          href="/"
          aria-label="Home"
          className="font-serif text-2xl md:absolute md:left-6"
        >
          CJ
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
              />
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <ul
          id="primary-menu"
          className="md:hidden flex flex-col gap-1 border-t border-surface-border px-4 py-3"
        >
          {links.map(({ href, label }, index) => (
            <li key={href}>
              <NavLink
                href={href}
                label={label}
                index={index}
                active={isActive(pathname, href)}
                onClick={() => setOpen(false)}
              />
            </li>
          ))}
        </ul>
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
}: {
  href: string;
  label: string;
  index: number;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-baseline gap-2 rounded-md px-3 py-1.5 transition-colors ${
        active
          ? "bg-zinc-100 dark:bg-zinc-800"
          : "text-foreground/70 hover:bg-zinc-50 hover:text-foreground dark:hover:bg-zinc-900"
      }`}
    >
      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
        {String(index + 1).padStart(2, "0")}
      </span>
      {label}
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
