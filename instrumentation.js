import {
  configureSync,
  getConsoleSink,
  jsonLinesFormatter,
} from "@logtape/logtape";

const isProduction = process.env.NODE_ENV === "production";

const consoleSinkConfig = isProduction ? { formatter: jsonLinesFormatter } : {};

configureSync({
  sinks: { console: getConsoleSink(consoleSinkConfig) },
  loggers: [
    {
      category: ["next-app"],
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: ["next-app", "middleware"],
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: ["next-app", "client"],
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: ["next-app", "contributions"],
      lowestLevel: "info",
      sinks: ["console"],
    },
  ],
});

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (!process.env.GITHUB_CONTRIBUTIONS_TOKEN) return;

  const { scheduleHomepageRevalidation } = await import(
    "./lib/schedule-homepage-revalidation"
  );
  scheduleHomepageRevalidation();
}
