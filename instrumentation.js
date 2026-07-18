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
  ],
});
