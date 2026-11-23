/**
 * Capabilities the pre-migration app (ebb1f49) had and the September rebuild
 * dropped, restored in November 2026. Each test names the old component it
 * stands in for. See docs/design/FORZA-FEATURE-PARITY.md.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApi, open, snapshot } from "./helpers";
import { normalizeItems, type Dataset } from "../../src/domain/items";
import {
  combineCost,
  componentsOf,
  effectParts,
  efficiencyVerdict,
  isStarterItem,
  isTankItem,
  itemTier,
  statMix,
  statShares,
} from "../../src/domain/verdict";
const items = normalizeItems(snapshot as Dataset);
const byId = (id: string) => items.find((item) => item.id === id)!;
test.beforeEach(async ({ page }) => mockApi(page));

test("verdict bands, tiers, shares and effect labels are derived, not recalculated", () => {
  expect(efficiencyVerdict(120).label).toBe("Excellent");
  expect(efficiencyVerdict(119.9).label).toBe("Good");
  expect(efficiencyVerdict(100).label).toBe("Good");
  expect(efficiencyVerdict(80).label).toBe("Fair");
  expect(efficiencyVerdict(79.9).label).toBe("Low");
  expect(itemTier(byId("3031")).label).toBe("Legendary");
  expect(itemTier(byId("1036")).label).toBe("Component");
  // Shares of an item's stat value add up to the whole.
  const shares = statShares(byId("3031"));
  expect(shares.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(100);
  expect(shares.reduce((sum, s) => sum + s.value, 0)).toBeCloseTo(
    byId("3031").value,
  );
  // A build's stat mix adds up to the sum of its items' backend values.
  const build = [byId("3031"), byId("3072")];
  expect(statMix(build).reduce((sum, s) => sum + s.value, 0)).toBeCloseTo(
    build[0]!.value + build[1]!.value,
  );
  // Recipe: components plus combine cost is the item's price.
  const edge = byId("3031");
  const parts = componentsOf(edge, items);
  expect(parts.map((p) => p.id).sort()).toEqual(["1018", "1037", "1038"]);
  expect(parts.reduce((sum, p) => sum + p.cost, 0) + combineCost(edge)).toBe(
    edge.cost,
  );
  // Named effects keep their kind; the stats block is not repeated.
  const cap = effectParts(byId("3089").description);
  expect(cap).toEqual([
    {
      kind: "passive",
      name: "Magical Opus",
      text: "Increases your total Ability Power by 30% .",
    },
  ]);
  expect(effectParts(byId("3031").description)).toEqual([]);
  expect(effectParts("")).toEqual([]);
  // Tank needs a resistance and health; starters are cheap and build up.
  for (const item of items.filter(isTankItem)) {
    expect(item.stats.FlatHPPoolMod).toBeGreaterThan(0);
    expect(
      (item.stats.FlatArmorMod || 0) + (item.stats.FlatSpellBlockMod || 0),
    ).toBeGreaterThan(0);
  }
  for (const item of items.filter(isStarterItem)) {
    expect(item.cost).toBeLessThanOrEqual(500);
    expect(item.tags).not.toContain("Boots");
  }
  expect(items.filter(isTankItem).length).toBeGreaterThan(0);
  expect(items.filter(isStarterItem).length).toBeGreaterThan(0);
});

test("catalog card and hover preview show tier, value and the verdict band (ItemCard, ItemStatsCard)", async ({
  page,
}) => {
  await open(page, "/items");
  await page
    .getByRole("searchbox", { name: "Find an item" })
    .fill("Infinity Edge");
  const card = page.locator(".catalog-item");
  await expect(card).toHaveCount(1);
  await expect(card.locator(".tier-pill")).toHaveText("Legendary");
  await expect(card).toContainText("Stat value");
  await expect(card).toContainText("3,625 G");
  await expect(card.locator(".efficiency-mark")).toHaveAttribute(
    "data-band",
    "good",
  );
  await expect(card.locator(".verdict-pill")).toHaveText("Good");
  await card.hover();
  const preview = page.getByRole("tooltip");
  await expect(preview).toContainText("Legendary");
  await expect(preview.locator(".verdict-pill")).toHaveText("Good");
  await expect(
    preview.getByRole("heading", { name: "Stats", exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Effects", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("searchbox", { name: "Find an item" })
    .fill("Rabadon's Deathcap");
  await expect(card.locator(".efficiency-mark")).toHaveAttribute(
    "data-band",
    "low",
  );
});

test("table headers sort both ways and Tank and Starter filters apply (ItemTableView, TypeFilter)", async ({
  page,
}) => {
  await open(page, "/items");
  await page.getByRole("button", { name: "Table", exact: true }).click();
  const header = page.getByRole("columnheader", { name: /Stat value/ });
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
  const values = async () =>
    (
      await page.locator(".catalog-table tbody tr td:nth-child(3)").allInnerTexts()
    ).map((text) => Number(text.replace(/[^\d.]/g, "")));
  let column = await values();
  expect(column).toEqual([...column].sort((a, b) => b - a));
  expect(column[0]).toBe(Math.max(...items.map((i) => Math.round(i.value))));
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  column = await values();
  expect(column).toEqual([...column].sort((a, b) => a - b));
  await expect(
    page.locator(".catalog-table tbody tr").first().locator(".verdict-pill"),
  ).toBeVisible();
  await page.getByRole("group", { name: "Item category" }).getByRole("button", { name: "Tank", exact: true }).click();
  await expect(page.locator(".result-heading")).toContainText(
    `${items.filter(isTankItem).length} items`,
  );
  await page.getByRole("group", { name: "Item category" }).getByRole("button", { name: "Starter", exact: true }).click();
  await expect(page.locator(".result-heading")).toContainText(
    `${items.filter(isStarterItem).length} items`,
  );
});

test("item drawer shows value, combine cost, shares, cost breakdown and named effects (ItemBreakdownModal)", async ({
  page,
}) => {
  await open(page, "/items");
  await page
    .getByRole("button", { name: "Inspect Rabadon's Deathcap", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  const overview = dialog.locator(".detail-overview");
  await expect(overview).toContainText("Stat value");
  await expect(overview).toContainText("2,600 G");
  await expect(overview).toContainText("Combine cost");
  await expect(overview).toContainText("1,100 G");
  await expect(dialog.locator(".detail-identity .verdict-pill")).toHaveText(
    "Low",
  );
  await expect(dialog.locator(".effect-kind")).toHaveText("Passive");
  await expect(dialog.locator(".effect-parts")).toContainText("Magical Opus");
  await expect(dialog.locator(".stat-value-bars li")).toHaveCount(1);
  await expect(dialog.locator(".stat-value-bars")).toContainText("100%");
  const cost = dialog.locator(".cost-breakdown");
  await expect(cost).toContainText("2,400 G"); // two Needlessly Large Rods
  await expect(cost).toContainText("+ 1,100 G");
  await expect(cost).toContainText("3,500 G");
  await expect(dialog.locator(".recipe-item").first()).toContainText("% stats");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Inspect Bloodthirster", exact: true })
    .click();
  // Two priced stats: the share ring appears with a text legend.
  await expect(dialog.locator(".donut-chart .chart-legend li")).toHaveCount(2);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);
});

test("compare page shows value, stat sources, recipe, the lead, and AI only on request (CompareItemCard, WinnerCard)", async ({
  page,
}) => {
  let aiRequests = 0;
  await page.route("**/api/items/*/ai", (route) => {
    aiRequests++;
    return route.fulfill({
      json: {
        status: "ready",
        patch: snapshot.version,
        effects: [{ name: "Compared effect", estimatedGoldValue: 300 }],
        bestOn: { champions: [{ name: "Ahri", why: "Fixture reason." }] },
      },
    });
  });
  await open(page, "/compare");
  // Add without leaving the page (AddItemCard).
  await page.getByRole("button", { name: "Find an item to add" }).click();
  const picker = page.getByRole("dialog");
  await picker
    .getByRole("searchbox", { name: "Find an item to compare" })
    .fill("Infinity Edge");
  await picker.getByRole("button", { name: /Infinity Edge/ }).click();
  await picker
    .getByRole("searchbox", { name: "Find an item to compare" })
    .fill("Rabadon's Deathcap");
  await picker.getByRole("button", { name: /Rabadon's Deathcap/ }).click();
  await picker.getByRole("button", { name: /Done/ }).click();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(3);
  const row = (name: string) =>
    page.locator(".comparison-table tbody tr").filter({
      has: page.getByRole("rowheader", { name, exact: true }),
    });
  await expect(row("Stat value")).toContainText("3,625 G");
  await expect(row("Stat value")).toContainText("+125 G against cost");
  await expect(row("Stat value")).toContainText("-900 G against cost");
  await expect(
    row("Where the value comes from").locator(".stat-value-bars").first(),
  ).toContainText("Attack damage");
  await expect(row("Recipe")).toContainText(
    "2,775 G in components + 725 G to combine",
  );
  await expect(page.locator(".winner-card")).toContainText("Infinity Edge");
  await expect(page.locator(".winner-card")).toContainText("by 29 pts");
  await expect(
    page.getByRole("figure", {
      name: "What each item costs in components and combine cost",
    }),
  ).toBeVisible();
  expect(aiRequests).toBe(0);
  await page
    .getByRole("button", { name: "Show AI analysis for Infinity Edge" })
    .click();
  await expect(row("AI effect analysis")).toContainText("Compared effect");
  expect(aiRequests).toBe(1);
  // Best-on rows carry the champion's portrait once the roster is known.
  await expect(
    row("AI effect analysis").locator("img.champion-portrait"),
  ).toHaveAttribute("src", /champion\/Ahri\.png$/);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);
});

test("a single compared item prompts for a second (CompareSingleItemNotice)", async ({
  page,
}) => {
  await open(page, "/items");
  await page
    .getByRole("button", { name: "Compare Infinity Edge", exact: true })
    .click();
  await page.goto("/compare");
  await expect(page.locator(".single-item-note")).toBeVisible();
});

test("champion study has its stat-mix ring, efficiency bars and build timeline (ChampionBuildCharts, ChampionTimelineChart)", async ({
  page,
}) => {
  await open(page, "/champions");
  await page.getByRole("button", { name: "Ahri", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Share of the build's stat value by stat" }),
  ).toBeVisible();
  await expect(
    page.getByRole("figure", {
      name: "Base-stat efficiency of each item in the build",
    }),
  ).toBeVisible();
  const timeline = page.locator(".line-chart");
  await expect(timeline.locator(".chart-line")).toHaveCount(3);
  await expect(timeline.locator(".chart-marker")).toHaveCount(2); // one marker per stage
  // 3500 G at 345 G/min from a 500 G start is 8.7 minutes.
  await expect(timeline.locator(".timeline-stages")).toContainText(
    "about 8.7 min at an even pace",
  );
  await expect(page.getByText("study's gold mark: 3500")).toBeVisible();
  await expect(page.getByText("Off-meta experiment")).toBeVisible();
  // The readout follows the keyboard.
  await timeline.locator("svg").focus();
  await page.keyboard.press("ArrowRight");
  await expect(timeline.locator(".chart-readout")).toContainText("Minute");
});

test("research shows the mispricing map and the fields the page had dropped (ResearchEfficiencyChart, ResearchOutliers)", async ({
  page,
}) => {
  await open(page, "/research");
  const map = page.locator(".mispricing-map");
  await expect(map.locator(".bar-rows li")).toHaveCount(2);
  // Lowest first.
  await expect(map.locator(".bar-rows li").first()).toContainText(
    "Rabadon's Deathcap",
  );
  await expect(map.locator(".bar-rows li").first()).toContainText("74%");
  await expect(page.locator(".outlier-figure").first()).toContainText("104%");
  await expect(page.getByText("900 G effect value")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Magical Opus" }),
  ).toBeVisible();
  await expect(page.locator(".for-champion")).toContainText("For Ahri");
  await expect(
    page.locator(".for-champion img.champion-portrait"),
  ).toHaveAttribute("src", /champion\/Ahri\.png$/);
});

test("saved builds show thumbnails, About lists the rates, and route changes are reported (SavedBuildsPanel, AboutStatValuesTable)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { _mfq: unknown[] })._mfq = [];
  });
  await open(page, "/builds?items=3031,3072");
  await expect(page.locator(".slot-efficiency").first()).toContainText(
    "104% stats",
  );
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page.locator(".saved-thumbs img")).toHaveCount(2);
  await page.getByRole("link", { name: /^Patch/ }).click();
  const table = page.locator(".method-table table");
  const sword = table.locator("tbody tr").filter({ hasText: "Long Sword" });
  await expect(sword).toContainText("35 G per point");
  await expect(
    table.locator("tbody tr").filter({ hasText: "Ruby Crystal" }),
  ).toContainText("2.67 G per point");
  const views = await page.evaluate(() =>
    (window as unknown as { _mfq: unknown[][] })._mfq
      .filter((entry) => entry[0] === "newPageView")
      .map((entry) => entry[1]),
  );
  expect(views).toContain("/about");
});

test("totals count to the exact value with motion on, and jump with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/builds?items=3031");
  const cost = page.locator(".summary-numbers strong").first();
  await expect(cost).toHaveText("3,500 G");
  await page.goto("/builds?items=3031,3072");
  await expect(cost).toHaveText("6,900 G"); // settles on the exact total
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Clear draft", exact: true }).click();
  expect(await cost.innerText()).toBe("0 G"); // no frames in between
});
