import Link from "next/link";
import type { ReactNode } from "react";

const linkClassName =
  "inline-flex size-8 items-center justify-center rounded-md transition-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:hover:text-gray-100";

const socialLinks = [
  {
    href: "https://x.com/chrisjarling",
    label: "X",
    external: true,
    icon: <XIcon />,
  },
  {
    href: "https://www.linkedin.com/in/chrispop/",
    label: "LinkedIn",
    external: true,
    icon: <LinkedInIcon />,
  },
  {
    href: "mailto:hi@chrisjarling.com",
    label: "Email",
    external: false,
    icon: <EmailIcon />,
  },
  {
    href: "/cv",
    label: "CV",
    external: false,
    icon: <CvIcon />,
  },
] as const;

export function IntroMeta() {
  return (
    <div className="not-prose my-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-500">
      <p className="flex items-center gap-1.5 whitespace-nowrap">
        <LocationPinIcon />
        <span>Copenhagen, Denmark</span>
      </p>
      <ul
        className="flex flex-wrap items-center gap-1"
        aria-label="Social links"
      >
        {socialLinks.map((link) => (
          <li key={link.label}>
            <ProfileLink
              href={link.href}
              label={link.label}
              external={link.external}
            >
              {link.icon}
            </ProfileLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external: boolean;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} aria-label={label} className={linkClassName}>
        {children}
        <span className="sr-only">{label}</span>
      </Link>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      className={linkClassName}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <span className="sr-only">{label}</span>
    </a>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      {children}
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <Icon>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <Icon>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Icon>
  );
}

function EmailIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  );
}

function CvIcon() {
  return (
    <Icon>
      <path d="M14.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14.5 3.5V8H19" />
      <path d="M8.5 13h7" />
      <path d="M8.5 17h4.5" />
    </Icon>
  );
}
