// Renders share images (1200×630 JPEG) for every page from the built static site.
// Usage: npm run build && npm run og   (then rebuild so out/ picks up the new images)
// Uses a real Chromium so Bangla text is shaped correctly.

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const OUT = "out";
const PORT = 4321;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(OUT, path.endsWith("/") ? `${path}index.html` : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(PORT, r));

// Card pages are generated for every (lang, slug); read the list from the build output.
const { readdir } = await import("node:fs/promises");
const jobs = [];
for (const lang of await readdir(join(OUT, "og-card"))) {
  for (const slug of await readdir(join(OUT, "og-card", lang))) jobs.push({ lang, slug });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const { lang, slug } of jobs) {
  await page.goto(`http://localhost:${PORT}/og-card/${lang}/${slug}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  for (const dir of ["public/og", "out/og"]) {
    await mkdir(join(dir, lang), { recursive: true });
    await page.locator("#card").screenshot({ path: join(dir, lang, `${slug}.jpg`), type: "jpeg", quality: 86 });
  }
  process.stdout.write(".");
}
// Apple touch icon from the SVG app icon, on the cover blue so it isn't transparent.
const svg = await readFile("src/app/icon.svg", "utf8");
const iconPage = await browser.newPage({ viewport: { width: 180, height: 180 } });
await iconPage.setContent(`<body style="margin:0;background:#1a2f7d;display:grid;place-items:center;height:180px">${svg.replace("<svg ", '<svg width="150" height="150" ')}</body>`);
await iconPage.screenshot({ path: "public/apple-touch-icon.png" });

await browser.close();
server.close();
console.log(`\n${jobs.length} share images written to public/og/`);
