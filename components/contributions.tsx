import { ContributionGraph } from "@/components/contribution-graph";
import { formatContributionTotal } from "@/lib/contribution-calendar";
import { getContributionCalendar } from "@/lib/github-contributions";

export async function Contributions() {
  const calendar = await getContributionCalendar();
  if (!calendar) return null;

  return (
    <section aria-labelledby="contributions" className="mt-16">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="contributions" className="text-xl font-semibold">
          Contributions
        </h2>
        <a
          href="https://github.com/Plsr"
          className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub →
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-500">{formatContributionTotal(calendar.total)}</p>
      <ContributionGraph calendar={calendar} />
    </section>
  );
}
