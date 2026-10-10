import Image from "next/image";

// Muted, paper-like tones so generated covers sit quietly next to real ones.
const PALETTE = [
  { bg: "#2f3e46", fg: "#e9e4d8" },
  { bg: "#7a3e2b", fg: "#f3e6d3" },
  { bg: "#3d5a40", fg: "#eef0e2" },
  { bg: "#c9b48a", fg: "#2b2418" },
  { bg: "#1f2a44", fg: "#e6d9b8" },
  { bg: "#8c6a8d", fg: "#f6eef4" },
  { bg: "#d8cfc0", fg: "#2a2a2a" },
  { bg: "#4a4e69", fg: "#f2e9e4" },
];

function hash(value: string) {
  let h = 0;
  for (const char of value) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * A 2:3 book cover. Uses the uploaded cover when there is one, otherwise
 * draws a typographic placeholder whose color is derived from the slug so it
 * stays stable between builds.
 */
export function BookCover({
  slug,
  title,
  author,
  cover,
  sizes,
  className = "",
}: {
  slug: string;
  title: string;
  author: string;
  cover: string | null;
  sizes: string;
  className?: string;
}) {
  const frame = `relative aspect-[2/3] overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_16px_-6px_rgba(0,0,0,0.25)] ${className}`;
  // Spine crease along the left edge, like a paperback.
  const spine = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/10 to-transparent"
    />
  );

  if (cover) {
    return (
      <div className={frame}>
        <Image
          src={cover}
          alt={`Cover of ${title}`}
          fill
          sizes={sizes}
          className="object-cover"
        />
        {spine}
      </div>
    );
  }

  const { bg, fg } = PALETTE[hash(slug) % PALETTE.length];

  return (
    <div
      className={`${frame} @container`}
      style={{ backgroundColor: bg, color: fg }}
      role="img"
      aria-label={`Cover of ${title}`}
    >
      {/* Sized in container units so the type scales with the cover itself. */}
      <div className="absolute inset-0 flex flex-col justify-between px-[10cqi] py-[11cqi] pl-[14cqi]">
        <span className="font-serif text-[clamp(0.3rem,12cqi,1.6rem)] leading-[1.1] text-balance">
          {title}
        </span>
        <span className="text-[clamp(0.2rem,6.5cqi,0.8rem)] uppercase tracking-[0.12em] opacity-80">
          {author}
        </span>
      </div>
      {spine}
    </div>
  );
}
