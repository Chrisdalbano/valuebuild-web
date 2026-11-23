import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
export const snapshot = JSON.parse(
  readFileSync(
    new URL("../../src/data/items.snapshot.json", import.meta.url),
    "utf8",
  ),
);
export const tftSnapshot = () =>
  JSON.parse(
    readFileSync(
      new URL("../../src/data/tft.snapshot.json", import.meta.url),
      "utf8",
    ),
  );
/** The same mocked API the workspace suite uses, for the newer spec files. */
export async function mockApi(page: Page) {
  await page.route("**/api/items", (r) =>
    r.fulfill({ json: { items: Object.values(snapshot.data) } }),
  );
  await page.route("**/api/metadata", (r) =>
    r.fulfill({
      json: { patch: snapshot.version, lastUpdated: snapshot.fetchedAt },
    }),
  );
  await page.route("**/api/items/*/ai", (r) =>
    r.fulfill({ json: { status: "pending", configured: true } }),
  );
  await page.route("**/api/champions", (r) =>
    r.fulfill({
      json: {
        champions: [
          {
            id: "Ahri",
            name: "Ahri",
            tags: ["Mage"],
            rangeType: "ranged",
            patch: snapshot.version,
          },
        ],
      },
    }),
  );
  await page.route("**/api/champions/Ahri/ai", (r) =>
    r.fulfill({
      json: {
        status: "ready",
        patch: snapshot.version,
        coreBuild: {
          itemIds: ["3089", "3157"],
          rationale: "Fixture champion study.",
        },
        progression: [
          {
            stage: "First purchase",
            gold: "400",
            itemIds: ["1052"],
            note: "Fixture stage.",
          },
          {
            stage: "Core item",
            gold: "3500",
            itemIds: ["3089"],
            note: "Second fixture stage.",
          },
        ],
        experimental: {
          title: "Fixture experiment",
          itemIds: ["3031"],
          rationale: "Off-meta fixture.",
        },
      },
    }),
  );
  await page.route("**/api/research", (r) =>
    r.fulfill({
      json: {
        status: "ready",
        patch: snapshot.version,
        outliers: [
          {
            itemId: "3031",
            name: "Infinity Edge",
            efficiency: 103.57,
            claim: "Fixture hypothesis.",
            direction: "undervalued",
          },
          {
            itemId: "3089",
            name: "Rabadon's Deathcap",
            efficiency: 74.29,
            claim: "Second fixture hypothesis.",
            direction: "overvalued",
          },
        ],
        effectSpotlights: [
          {
            itemId: "3089",
            name: "Rabadon's Deathcap",
            effectName: "Magical Opus",
            insight: "Fixture insight.",
            estimatedEffectGold: 900,
          },
        ],
        experimentalBuilds: [
          {
            title: "Fixture build",
            itemIds: ["3031", "3072"],
            rationale: "Test this combination.",
            forChampion: "Ahri",
          },
        ],
      },
    }),
  );
  await page.route("**/api/research/champions", (r) =>
    r.fulfill({
      json: {
        status: "ready",
        championCount: 1,
        topItems: [{ itemId: "3031", count: 1 }],
        experiments: [],
      },
    }),
  );
  await page.route("**/api/tft/**", (r) => r.fulfill({ status: 503 }));
  await page.route("**/cdn.mouseflow.com/**", (r) => r.abort());
}
export const open = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};
