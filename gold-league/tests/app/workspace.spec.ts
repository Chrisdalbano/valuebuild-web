import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const snapshot = JSON.parse(
  readFileSync(
    new URL("../../src/data/items.snapshot.json", import.meta.url),
    "utf8",
  ),
);
import { optimizeBuild } from "../../src/domain/optimizer";
import {
  normalizeItems,
  totals,
  parseIds,
  type Dataset,
} from "../../src/domain/items";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/items", (r) =>
    r.fulfill({ json: { items: Object.values(snapshot.data) } }),
  );
  await page.route("**/api/metadata", (r) =>
    r.fulfill({
      json: { patch: snapshot.version, lastUpdated: snapshot.fetchedAt },
    }),
  );
  await page.route("**/api/items/*/ai", (r) =>
    r.fulfill({ json: { status: "pending" } }),
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
        ],
        situational: [
          {
            when: "Defensive option",
            itemIds: ["3157"],
            why: "Fixture context.",
          },
        ],
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
            claim: "Fixture hypothesis.",
            direction: "study",
          },
        ],
        experimentalBuilds: [
          {
            title: "Fixture build",
            itemIds: ["3031", "3072"],
            rationale: "Test this combination.",
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
  await page.route("**/cdn.mouseflow.com/**", (r) => r.abort());
});
const open = async (page: any, path: string) => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};
test("backend values stay authoritative and totals are additive", () => {
  const items = normalizeItems(snapshot as Dataset);
  const sword = items.find((i) => i.id === "1036")!;
  expect(sword.efficiency).toBeCloseTo(100);
  expect(sword.value).toBe(sword.cost);
  const selected = items.filter((i) => ["3031", "3089"].includes(i.id));
  expect(totals(selected).cost).toBe(selected[0]!.cost + selected[1]!.cost);
  expect(totals([]).efficiency).toBe(0);
  expect(parseIds(["1036", "1036", "bad", "<script>", 1001])).toEqual(["1036"]);
  expect(items.find((i) => i.id === "3031")!.efficiency).toBe(
    snapshot.data["3031"].goldEfficiency,
  );
  const result = optimizeBuild(items, 12000);
  expect(result.length).toBeLessThanOrEqual(6);
  expect(totals(result).cost).toBeLessThanOrEqual(12000);
  expect(new Set(result.map((i) => i.id)).size).toBe(result.length);
});
test("search, build, undo, save, reload, and share", async ({ page }) => {
  await open(page, "/items");
  await page
    .getByRole("searchbox", { name: "Find an item" })
    .fill("Infinity Edge");
  await expect(page.locator(".catalog-item")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Add Infinity Edge to build", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Add Infinity Edge to build",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Remove Infinity Edge", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("link", { name: "Open build lab", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Build name" })
    .fill("Critical study");
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".build-slot")).toHaveCount(1);
  await expect(page.locator(".saved-load")).toContainText("Critical study");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Build link" })).toHaveValue(
    /items=3031/,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("comparison persists and displays differences", async ({ page }) => {
  await open(page, "/items");
  await page
    .getByRole("button", { name: "Compare Infinity Edge", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare Rabadon's Deathcap", exact: true })
    .click();
  await page.getByRole("link", { name: /Compare 2/ }).click();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(3);
  await expect(page.getByText("Baseline", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Remove Infinity Edge from comparison" })
    .click();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(2);
});
test("share links validate IDs and enforce six unique slots", async ({
  page,
}) => {
  await open(page, "/builds?items=3031,3089,3072,3078,3036,3157,1036,3031,bad");
  await expect(page.locator(".build-slot")).toHaveCount(6);
  await expect(
    page.getByRole("button", { name: "Add Infinity Edge to build" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Clear draft", exact: true }).click();
  await expect(page.locator(".build-slot")).toHaveCount(0);
  await page
    .locator(".editor-footer")
    .getByRole("button", { name: "Undo" })
    .click();
  await expect(page.locator(".build-slot")).toHaveCount(6);
});
test("overlay and select preserve geometry and return focus", async ({
  page,
}) => {
  await open(page, "/items");
  const before = await page.locator(".site-header").boundingBox();
  await page.getByRole("combobox", { name: "Gold budget" }).click();
  await page.getByRole("option", { name: "Up to 500 G", exact: true }).click();
  expect((await page.locator(".site-header").boundingBox())!.width).toBeCloseTo(
    before!.width,
    0,
  );
  const inspect = page.getByRole("button", { name: /^Inspect / }).first();
  await inspect.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect((await page.locator(".site-header").boundingBox())!.width).toBeCloseTo(
    before!.width,
    0,
  );
  await page.keyboard.press("Escape");
  await expect(inspect).toBeFocused();
});
test("saved-build deletion is explicit and leaves draft", async ({ page }) => {
  await open(page, "/builds?items=3031");
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete Untitled build", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".saved-load")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Delete Untitled build", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete build", exact: true }).click();
  await expect(page.locator(".saved-load")).toHaveCount(0);
  await expect(page.locator(".build-slot")).toHaveCount(1);
});
test("network failure and broken storage do not block the explorer", async ({
  page,
}) => {
  await page.route("**/api/items", (r) => r.abort());
  await page.addInitScript(() =>
    localStorage.setItem("buildvalue.workspace.v2", "broken json"),
  );
  await open(page, "/items");
  await expect(
    page.getByText("Bundled snapshot · offline fallback", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".catalog-item")).toHaveCount(15);
  await page
    .getByRole("searchbox", { name: "Find an item" })
    .fill("no item has this name");
  await expect(page.getByText("No items match.")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".catalog-item")).toHaveCount(15);
});
for (const width of [390, 768, 1440])
  test(`responsive routes and accessibility at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/",
      "/items",
      "/compare",
      "/builds",
      "/champions",
      "/research",
      "/about",
    ]) {
      await open(page, route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
test("landing motion cleans up across route changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/");
  await expect(page.locator(".hero-copy h1")).toBeVisible();
  await page.getByRole("button", { name: "Study Rabadon's Deathcap" }).click();
  await expect(page.locator(".study-content h2")).toHaveText(
    "Rabadon's Deathcap",
  );
  await page.getByRole("button", { name: "Start with this item" }).click();
  await expect(page.locator(".build-slot")).toHaveCount(1);
  await page.getByRole("link", { name: "BuildValue home" }).click();
  await page.locator(".forza-credit").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: "Explore Forza UI" }),
  ).toBeVisible();
});

test("legacy saved builds and share links migrate without deletion", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "bv:saved-builds",
      JSON.stringify({
        builds: [
          {
            id: "old1",
            name: "Legacy build",
            itemIds: ["3031", "3072"],
            savedAt: 1700000000000,
          },
        ],
      }),
    ),
  );
  await open(page, "/builds?b=3031,3072");
  await expect(page.locator(".build-slot")).toHaveCount(2);
  await expect(page.locator(".saved-load")).toContainText("Legacy build");
  expect(
    await page.evaluate(() => localStorage.getItem("bv:saved-builds")),
  ).toContain("Legacy build");
});
test("champion study and research build handoff", async ({ page }) => {
  await open(page, "/champions");
  await page.getByRole("button", { name: "Ahri", exact: true }).click();
  await expect(page.getByText("Fixture champion study.")).toBeVisible();
  await page.getByRole("button", { name: "Try build", exact: true }).click();
  await expect(page.locator(".build-slot")).toHaveCount(2);
  await page.getByRole("link", { name: "Research", exact: true }).click();
  await expect(page.getByText("Fixture hypothesis.")).toBeVisible();
  await page.getByRole("button", { name: "Try build", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Build name" })).toHaveValue(
    "Fixture build",
  );
});
test("budget planner produces an editable build", async ({ page }) => {
  await open(page, "/builds");
  await page.getByRole("button", { name: "Find a starting point" }).click();
  await page
    .locator(".budget-result")
    .getByRole("button", { name: "Try build" })
    .click();
  await expect(page.locator(".build-slot").first()).toBeVisible();
});

test("champion roster prefers the latest record when names repeat", async ({
  page,
}) => {
  await page.route("**/api/champions", (r) =>
    r.fulfill({
      json: {
        champions: [
          {
            id: "Ahri",
            name: "Ahri",
            tags: ["Mage"],
            rangeType: "ranged",
            patch: "16.18.1",
          },
          {
            id: "Jade_Ahri",
            name: "Ahri",
            tags: ["Mage"],
            rangeType: "ranged",
            patch: "16.15.1",
          },
        ],
      },
    }),
  );
  await open(page, "/champions");
  await expect(
    page.getByRole("button", { name: "Ahri", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Ahri", exact: true }).click();
  await expect(page.getByText("Fixture champion study.")).toBeVisible();
});


test("effect study displays the backend estimate and reasoning", async ({ page }) => {
  await page.route("**/api/items/*/ai", r => r.fulfill({ json: {
    status: "ready", effects: [{ name: "Measured effect", estimatedGoldValue: 450,
      reasoning: ["First explanation.", "Second explanation."], confidence: "low",
      baseStatEquivalence: "Equivalent to a small stat purchase." }]
  } }));
  await open(page, "/items");
  await page.getByRole("button", { name: /^Inspect / }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Estimated effect value: 450 G/)).toBeVisible();
  await expect(dialog.getByText("First explanation. Second explanation.")).toBeVisible();
});
