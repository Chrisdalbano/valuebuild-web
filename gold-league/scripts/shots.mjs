// Screenshot review for the November 2026 overhaul.
// Usage: node scripts/shots.mjs <outDir> [baseUrl] [width]
// Needs a dev or preview server at baseUrl (default http://127.0.0.1:5198).
// Reads the live API through the dev proxy; it triggers no generation.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const outDir = process.argv[2] || "shots";
const base = (process.argv[3] || "http://127.0.0.1:5198").replace(/\/$/, "");
const width = Number(process.argv[4] || 1440);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`${page.url()}: ${message.text()}`);
});
await page.route("**/cdn.mouseflow.com/**", (route) => route.abort());

async function shot(name, route, act) {
  await page.goto(base + route);
  await page.waitForLoadState("networkidle").catch(() => {});
  if (act) await act(page);
  await page.waitForTimeout(900);
  const file = path.resolve(outDir, `${name}-${width}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`captured ${file}`);
}

const only = process.env.SHOTS ? process.env.SHOTS.split(",") : null;
const plan = [
  ["items", "/items"],
  [
    "items-table",
    "/items",
    (p) => p.getByRole("button", { name: "Table", exact: true }).click(),
  ],
  [
    "item-drawer",
    "/items",
    (p) =>
      p.getByRole("button", { name: "Inspect Bloodthirster", exact: true }).click(),
  ],
  [
    "hover",
    "/items",
    async (p) => {
      await p.getByRole("searchbox", { name: "Find an item" }).fill("Infinity Edge");
      await p.locator(".catalog-item").first().hover();
    },
  ],
  ["compare", "/compare"],
  ["builds", "/builds?items=3031,3072,3089,3157"],
  [
    "champion",
    "/champions",
    async (p) => {
      await p.getByRole("button", { name: "Ahri", exact: true }).click();
      await p.waitForLoadState("networkidle").catch(() => {});
    },
  ],
  ["research", "/research"],
  ["about", "/about"],
  ["landing", "/"],
  ["tft", "/tft"],
  ["tft-items", "/tft/items"],
  ["tft-traits", "/tft/traits"],
  ["tft-review", "/tft/review"],
];
// Seed a comparison so the compare page has something to show.
await page.goto(base + "/items");
await page.evaluate(() =>
  localStorage.setItem(
    "buildvalue.workspace.v2",
    JSON.stringify({ build: [], compare: ["3031", "3089", "3072"], saved: [], name: "Untitled build" }),
  ),
);
for (const [name, route, act] of plan)
  if (!only || only.includes(name))
    await shot(name, route, act).catch((error) =>
      console.log(`FAILED ${name}: ${error.message.split("\n")[0]}`),
    );
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "no page errors");
await browser.close();
