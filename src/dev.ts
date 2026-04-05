import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { watch } from "chokidar";
import { build } from "./build.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT ?? 3000);

// SSE clients waiting for reload events
const clients = new Set<http.ServerResponse>();

function broadcast(): void {
  for (const res of clients) {
    res.write("event: reload\ndata: {}\n\n");
  }
}

// Injected into every HTML response to auto-reload on change
const RELOAD_SCRIPT = `<script>
  new EventSource("/__reload").addEventListener("reload", () => location.reload());
</script>`;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";

  // SSE endpoint
  if (url === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(":\n\n"); // initial comment to open the connection
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  // Strip query string before resolving
  const pathname = new URL(url, "http://localhost").pathname;

  // Resolve file path, treating "/" as "/index.html"
  let filePath = path.join(DIST_DIR, pathname === "/" ? "/index.html" : pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end();
    return;
  }

  // Resolve directories and extensionless paths to their index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  } else if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + ".html")) {
      filePath += ".html";
    } else if (fs.existsSync(path.join(filePath, "index.html"))) {
      filePath = path.join(filePath, "index.html");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] ?? "application/octet-stream";
  let content = fs.readFileSync(filePath);

  if (ext === ".html") {
    // Inject reload script before </body>
    const html = content.toString("utf-8").replace("</body>", `${RELOAD_SCRIPT}\n</body>`);
    content = Buffer.from(html, "utf-8");
  }

  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
});

// Initial build
build();

// Watch source files
const watcher = watch(
  [
    path.join(ROOT, "posts"),
    path.join(ROOT, "pages"),
    path.join(ROOT, "src"),
    path.join(ROOT, "style.css"),
  ],
  { ignoreInitial: true }
);

watcher.on("all", (event, file) => {
  const rel = path.relative(ROOT, file);
  console.log(`  ${event}: ${rel} — rebuilding...`);
  try {
    build();
    broadcast();
  } catch (err) {
    console.error("build error:", err);
  }
});

server.listen(PORT, () => {
  console.log(`dev server running at http://localhost:${PORT}`);
});
