import type {
  ContributionCalendar,
  ContributionDay,
  ContributionLevel,
} from "@/lib/contribution-calendar";

const FIXTURE_MARKER = "dev-only-contribution-fixture";

export function buildFixtureCalendar(now = new Date()): ContributionCalendar {
  if (process.env.NODE_ENV !== "development") {
    throw new Error(`${FIXTURE_MARKER} cannot run outside development`);
  }

  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yearAgo = new Date(end);
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);

  const cursor = new Date(yearAgo);
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());

  const days: ContributionDay[] = [];
  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    days.push({
      date,
      count: fixtureCount(cursor),
      level: 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const levelFor = quartileLevels(days);
  for (const day of days) {
    day.level = levelFor(day.count);
  }

  const weeks: ContributionDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return {
    total: days.reduce((sum, day) => sum + day.count, 0),
    weeks,
  };
}

function quartileLevels(days: ContributionDay[]): (count: number) => ContributionLevel {
  const positive = days
    .map((day) => day.count)
    .filter((count) => count > 0)
    .sort((a, b) => a - b);

  const quantile = (ratio: number) =>
    positive[Math.min(positive.length - 1, Math.floor(positive.length * ratio))] ?? 1;

  const first = quantile(0.25);
  const second = quantile(0.5);
  const third = quantile(0.75);

  return (count) => {
    if (count <= 0) return 0;
    if (count <= first) return 1;
    if (count <= second) return 2;
    if (count <= third) return 3;
    return 4;
  };
}

function fixtureCount(date: Date): number {
  const month = date.getUTCMonth();
  const dayOfMonth = date.getUTCDate();
  if (month === 7 && dayOfMonth >= 3 && dayOfMonth <= 16) return 0;

  const weekday = date.getUTCDay();
  const index = Math.floor(date.getTime() / 86_400_000);
  const noise = Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1;

  if (weekday === 0 || weekday === 6) {
    return noise > 0.82 ? 1 : 0;
  }

  if (noise < 0.16) return 0;
  if (noise < 0.42) return 1 + Math.floor(noise * 2);
  if (noise < 0.68) return 3 + Math.floor(noise * 3);
  if (noise < 0.86) return 6 + Math.floor(noise * 3);
  return 11 + Math.floor(noise * 4);
}
