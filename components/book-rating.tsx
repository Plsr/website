export function BookRating({
  rating,
  className = "",
}: {
  rating: number | null;
  className?: string;
}) {
  if (!rating) return null;

  return (
    <span
      className={`tracking-[0.15em] text-amber-600 dark:text-amber-400 ${className}`}
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {"★".repeat(rating)}
      <span className="text-zinc-300 dark:text-zinc-700">
        {"★".repeat(5 - rating)}
      </span>
    </span>
  );
}
