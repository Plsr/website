import "server-only";

import { getLogger } from "@logtape/logtape";
import {
  parseContributionCalendar,
  type ContributionCalendar,
} from "@/lib/contribution-calendar";

const logger = getLogger(["next-app", "contributions"]);

const CONTRIBUTION_QUERY = `
  query {
    user(login: "Plsr") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

export async function getContributionCalendar(): Promise<ContributionCalendar | null> {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.GITHUB_CONTRIBUTIONS_USE_FIXTURE === "1"
  ) {
    const { buildFixtureCalendar } = await import("./github-contributions-fixture");
    return buildFixtureCalendar();
  }

  const token = process.env.GITHUB_CONTRIBUTIONS_TOKEN;
  if (!token) {
    logger.info("GITHUB_CONTRIBUTIONS_TOKEN is unset; hiding the contribution graph");
    return null;
  }

  try {
    return await fetchContributionCalendar(token);
  } catch (error) {
    logger.error("GitHub contribution calendar request failed", {
      error: error instanceof Error ? error.message : "unknown error",
    });
    return null;
  }
}

async function fetchContributionCalendar(token: string): Promise<ContributionCalendar> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "chrisjarling.com",
    },
    body: JSON.stringify({ query: CONTRIBUTION_QUERY }),
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 86400, tags: ["github-contributions"] },
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL responded with HTTP ${response.status}`);
  }

  return parseContributionCalendar(await response.json());
}
