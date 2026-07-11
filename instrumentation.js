import { configureSync, getConsoleSink } from "@logtape/logtape";

configureSync({
  sinks: { console: getConsoleSink() },
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
