// Dev server: rebuild on change, serve dist/ on :3000. Refresh the browser manually.
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { OUT, build } from "./build.ts";

const types: Record<string, string> = { ".html": "text/html", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".js": "text/javascript" };

const rebuild = () => { try { build(); } catch (e) { console.error(e); } };
rebuild();
let timer: NodeJS.Timeout;
for (const dir of ["content", "pages", "static"]) {
  watch(dir, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(rebuild, 100); });
}

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  if (path.endsWith("/")) path += "index.html";
  else if (!extname(path)) path += "/index.html";
  try {
    const body = await readFile(join(OUT, path)); // read first: a failed read after writeHead can't send a 404
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(3000, () => console.log("http://localhost:3000"));
