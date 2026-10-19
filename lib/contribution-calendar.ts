export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type ContributionCalendar = {
  total: number;
  weeks: ContributionDay[][];
};

const LEVEL_BY_NAME: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatContributionTotal(total: number): string {
  const noun = total === 1 ? "contribution" : "contributions";
  return `${total.toLocaleString("en-US")} ${noun} in the last year`;
}

export function formatContributionDay(day: ContributionDay): string {
  const date = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  if (day.count === 0) return `${date}: No contributions`;
  if (day.count === 1) return `${date}: 1 contribution`;
  return `${date}: ${day.count.toLocaleString("en-US")} contributions`;
}

export function weekdayIndex(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

type GraphQLError = { message?: unknown };

type CalendarPayload = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: unknown;
          weeks?: unknown;
        };
      };
    } | null;
  };
  errors?: GraphQLError[];
};

export function parseContributionCalendar(payload: unknown): ContributionCalendar {
  if (!payload || typeof payload !== "object") {
    throw new Error("GitHub contribution calendar response was not an object");
  }

  const body = payload as CalendarPayload;
  const errorMessage = firstErrorMessage(body.errors);
  if (errorMessage) {
    throw new Error(`GitHub contribution calendar query failed: ${errorMessage}`);
  }

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error("GitHub contribution calendar response was incomplete");
  }

  if (typeof calendar.totalContributions !== "number" || !Number.isFinite(calendar.totalContributions)) {
    throw new Error("GitHub contribution calendar total was missing");
  }

  if (!Array.isArray(calendar.weeks) || calendar.weeks.length === 0) {
    throw new Error("GitHub contribution calendar did not include any weeks");
  }

  const weeks = calendar.weeks.map((week) => parseWeek(week));
  if (weeks.every((week) => week.length === 0)) {
    throw new Error("GitHub contribution calendar did not include any days");
  }

  return {
    total: calendar.totalContributions,
    weeks,
  };
}

function parseWeek(week: unknown): ContributionDay[] {
  if (!week || typeof week !== "object" || !("contributionDays" in week)) {
    throw new Error("GitHub contribution calendar week was malformed");
  }

  const days = (week as { contributionDays?: unknown }).contributionDays;
  if (!Array.isArray(days)) {
    throw new Error("GitHub contribution calendar week was malformed");
  }

  return days.map((day) => parseDay(day));
}

function parseDay(day: unknown): ContributionDay {
  if (!day || typeof day !== "object") {
    throw new Error("GitHub contribution calendar day was malformed");
  }

  const record = day as {
    date?: unknown;
    contributionCount?: unknown;
    contributionLevel?: unknown;
  };

  if (typeof record.date !== "string" || !DATE_PATTERN.test(record.date)) {
    throw new Error("GitHub contribution calendar day had an invalid date");
  }

  if (
    typeof record.contributionCount !== "number" ||
    !Number.isInteger(record.contributionCount) ||
    record.contributionCount < 0
  ) {
    throw new Error("GitHub contribution calendar day had an invalid count");
  }

  if (typeof record.contributionLevel !== "string" || !(record.contributionLevel in LEVEL_BY_NAME)) {
    throw new Error("GitHub contribution calendar day had an invalid level");
  }

  return {
    date: record.date,
    count: record.contributionCount,
    level: LEVEL_BY_NAME[record.contributionLevel],
  };
}

function firstErrorMessage(errors: GraphQLError[] | undefined): string | null {
  const message = errors?.find((error) => typeof error.message === "string")?.message;
  return typeof message === "string" && message.length > 0 ? message : null;
}
