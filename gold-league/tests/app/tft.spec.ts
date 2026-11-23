/**
 * Teamfight Tactics: the roll-odds model against hand-worked cases and an
 * independent simulation, the unit and trait arithmetic, and the four pages.
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApi, open, tftSnapshot } from "./helpers";
import {
  copiesFor,
  goldFor,
  levelCost,
  rollDown,
  slotChance,
  type RollInput,
} from "../../src/domain/tft/odds";
import {
  componentStats,
  emptyLoadout,
  itemStats,
  poolUnits,
  profile,
  worthOn,
} from "../../src/domain/tft/units";
import { priceTraits } from "../../src/domain/tft/traits";
import type { TftSet } from "../../src/domain/tft/types";
const set = tftSnapshot() as TftSet;
const economy = set.economy;
const unit = (name: string) => set.units.find((entry) => entry.name === name)!;
const base: RollInput = {
  tierOdds: 0.3,
  unitCost: 4,
  copiesLeft: 10,
  tierLeft: 140,
  need: 1,
  rerollCost: 2,
  slots: 5,
};
const q = (0.3 * 10) / 140;
test.beforeEach(async ({ page }) => mockApi(page));

test("roll odds match hand-worked cases", () => {
  expect(slotChance(base, 0)).toBeCloseTo(q, 12);
  // One reroll, one slot, enough gold for the copy: the slot chance itself.
  expect(rollDown({ ...base, slots: 1 }, 6).hitByGold[6]).toBeCloseTo(q, 12);
  // One reroll of five slots: at least one of five.
  expect(rollDown(base, 6).hitByGold[6]).toBeCloseTo(1 - (1 - q) ** 5, 12);
  // Two copies from one two-slot shop: the second draw sees one copy fewer.
  const second = (0.3 * 9) / 139;
  expect(
    rollDown({ ...base, slots: 2, need: 2 }, 10).hitByGold[10],
  ).toBeCloseTo(q * second, 12);
  // A copy you cannot pay for is not a hit: 2 gold to roll leaves 3 of 4.
  expect(rollDown(base, 5).hitByGold[5]).toBe(0);
  expect(rollDown(base, 1).hitByGold[1]).toBe(0);
  // Fewer copies in the pool than you need: never.
  expect(
    rollDown({ ...base, need: 3, copiesLeft: 2, tierLeft: 132 }, 100)
      .hitByGold[100],
  ).toBe(0);
  // Nothing left to find: already done.
  expect(rollDown({ ...base, need: 0 }, 0).hitByGold[0]).toBe(1);
  // A shop pattern of 5 then 4 slots: two rerolls are nine draws.
  expect(
    rollDown({ ...base, slots: [5, 4] }, 8).hitByGold[8],
  ).toBeCloseTo(1 - (1 - q) ** 9, 12);
  const result = rollDown(base, 6);
  expect(result.perShop).toBeCloseTo(5 * q, 12);
  expect(result.seenPerShop).toBeCloseTo(1 - (1 - q) ** 5, 12);
});

test("roll odds behave like odds: bounded, cumulative, and worse when contested", () => {
  const input = { ...base, need: 3 };
  const result = rollDown(input, 120);
  for (let gold = 1; gold <= 120; gold++) {
    expect(result.hitByGold[gold]!).toBeGreaterThanOrEqual(
      result.hitByGold[gold - 1]!,
    );
    expect(result.hitByGold[gold]!).toBeLessThanOrEqual(1);
  }
  expect(result.copies.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 10);
  expect(result.copies[3]).toBeCloseTo(result.hitByGold[120]!, 10);
  const contested = rollDown({ ...input, copiesLeft: 6, tierLeft: 136 }, 120);
  expect(contested.hitByGold[120]!).toBeLessThan(result.hitByGold[120]!);
  // Thinning the rest of the tier makes your unit a larger share of it.
  const thinned = rollDown({ ...input, tierLeft: 100 }, 120);
  expect(thinned.hitByGold[120]!).toBeGreaterThan(result.hitByGold[120]!);
  const half = goldFor(result.hitByGold, 0.5)!;
  expect(result.hitByGold[half]!).toBeGreaterThanOrEqual(0.5);
  expect(result.hitByGold[half - 1]!).toBeLessThan(0.5);
  expect(goldFor(result.hitByGold, 1.1)).toBeNull();
});

test("the exact roll model agrees with an independent simulation", () => {
  // A plain simulation of the same rules, written separately from the model:
  // roll, walk the slots, buy what you can afford, stop when done or broke.
  let seed = 20261123;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const input: RollInput = { ...base, need: 3, slots: [5, 4] };
  const budget = 50,
    trials = 60000;
  let hits = 0;
  for (let trial = 0; trial < trials; trial++) {
    let gold = budget,
      have = 0,
      rolls = 0;
    while (have < 3 && gold >= 2) {
      gold -= 2;
      const slots = [5, 4][rolls++ % 2]!;
      for (let slot = 0; slot < slots; slot++) {
        const chance = 0.3 * ((10 - have) / (140 - have));
        if (have < 3 && gold >= 4 && random() < chance) {
          have++;
          gold -= 4;
        }
      }
    }
    if (have >= 3) hits++;
  }
  const exact = rollDown(input, budget).hitByGold[budget]!;
  // Three standard errors at 60,000 trials is about 0.005.
  expect(Math.abs(hits / trials - exact)).toBeLessThan(0.008);
  expect(exact).toBeGreaterThan(0.15);
  expect(exact).toBeLessThan(0.35);
});

test("economy constants in the snapshot are the published ones", () => {
  // Riot Data Dragon tft-shop-drop-rates-data.json 16.23.1, read 2026-11-23.
  expect(economy.shopOdds["8"]).toEqual([15, 20, 32, 30, 3]);
  expect(economy.shopOdds["9"]).toEqual([10, 17, 25, 33, 15]);
  expect(economy.shopOdds["3"]).toEqual([75, 25, 0, 0, 0]);
  for (const row of Object.values(economy.shopOdds))
    expect(row.reduce((sum, value) => sum + value, 0)).toBe(100);
  expect(economy.poolSize).toEqual([30, 25, 18, 10, 9]);
  expect(economy.rerollCost).toBe(2);
  expect(economy.verified).toBe(true);
  // One base unit per bag entry: 14 / 13 / 14 / 14 / 10 in set 18.
  const perCost = [1, 2, 3, 4, 5].map(
    (cost) => poolUnits(set).filter((entry) => entry.cost === cost).length,
  );
  expect(perCost).toEqual([14, 13, 14, 14, 10]);
  // Levelling: 60 XP from 7, 68 from 8 and from 9; 4 gold buys 4 XP.
  const cost = (level: number, into = 0, levels = 1) =>
    levelCost(level, into, levels, economy.xpToNext, economy.xpPurchase);
  expect(cost(7)).toBe(60);
  expect(cost(8)).toBe(68);
  expect(cost(8, 10)).toBe(60); // 58 XP left is 15 purchases
  expect(cost(8, 0, 2)).toBe(136);
  expect(cost(10)).toBeNull(); // top of the table
  expect([1, 2, 3].map((star) => copiesFor(star, economy.copiesPerStar))).toEqual([
    1, 3, 9,
  ]);
  for (const source of Object.values(economy.sources))
    expect(source.url).toMatch(/^https:\/\//);
});

test("a component's worth on a unit follows from the unit's own stats", () => {
  const ahri = unit("Ahri");
  const on = (component: string, star = 2) =>
    worthOn(ahri, star, componentStats(set, component), economy);
  // +10% attack damage or attack speed is +10% attack output on anyone.
  expect(on("TFT_Item_BFSword").attackOutput).toBeCloseTo(10, 6);
  expect(on("TFT_Item_RecurveBow").attackOutput).toBeCloseTo(10, 6);
  // 20% crit on a 25% / 1.4x unit: (1 + 0.45*0.4) / (1 + 0.25*0.4) - 1.
  expect(on("TFT_Item_SparringGloves").attackOutput).toBeCloseTo(
    (1.18 / 1.1 - 1) * 100,
    6,
  );
  // 20 armor on 40 armor: 1.6 / 1.4 - 1. It does nothing against magic.
  const vest = on("TFT_Item_ChainVest");
  expect(vest.physicalHealth).toBeCloseTo((1.6 / 1.4 - 1) * 100, 6);
  expect(vest.magicHealth).toBe(0);
  expect(vest.attackOutput).toBe(0);
  // 150 health on a two-star Ahri: 850 x 1.8 = 1530 health.
  expect(profile(ahri, 2, emptyLoadout(), economy).health).toBeCloseTo(1530, 6);
  expect(on("TFT_Item_GiantsBelt").physicalHealth).toBeCloseTo(
    (150 / 1530) * 100,
    6,
  );
  // The same belt is worth less on a three-star (850 x 3.24 = 2754 health).
  expect(on("TFT_Item_GiantsBelt", 3).physicalHealth).toBeCloseTo(
    (150 / 2754) * 100,
    6,
  );
  expect(profile(ahri, 3, emptyLoadout(), economy).attackDamage).toBeCloseTo(
    ahri.stats.ad * 2.25,
    6,
  );
  // Ability power and mana are reported as not modelled, never as zero value.
  expect(on("TFT_Item_NeedlesslyLargeRod").unmodelled).toEqual(["AP"]);
  // Deathblade: 55% attack damage is +55% attack output.
  const blade = set.items.find((item) => item.name === "Deathblade")!;
  expect(worthOn(ahri, 2, itemStats(blade), economy).attackOutput).toBeCloseTo(
    55,
    6,
  );
});

test("item ledger and trait prices are consistent with the set data", () => {
  const item = (name: string) => set.items.find((entry) => entry.name === name)!;
  expect(item("Deathblade").statEfficiency).toBe(275);
  expect(item("Infinity Edge").statComponents).toBe(5.25);
  expect(set.items).toHaveLength(39);
  for (const entry of set.items) {
    expect(entry.componentsSpent).toBe(2);
    const sum = entry.statBreakdown.reduce((total, line) => total + line.components, 0);
    expect(entry.statComponents).toBeCloseTo(sum, 3);
    expect(entry.statEfficiency).toBeCloseTo((sum / 2) * 100, 0);
    for (const line of entry.statBreakdown)
      expect(line.components).toBeCloseTo(
        line.amount / set.statRates[line.key]!.perComponent,
        3,
      );
  }
  const prices = priceTraits(set);
  expect(prices.length).toBeGreaterThan(20);
  for (const price of prices) {
    let last = 0;
    for (const step of price.steps) {
      if (step.gold === null) {
        expect(price.members.length).toBeLessThan(step.units);
        expect(step.short).toBe(step.units - price.members.length);
        continue;
      }
      // The cheapest N members, and no cheaper choice exists.
      const cheapest = [...price.members]
        .map((member) => member.cost)
        .sort((a, b) => a - b)
        .slice(0, step.units)
        .reduce((sum, cost) => sum + cost, 0);
      expect(step.gold).toBe(cheapest);
      expect(step.added).toBe(step.gold - last);
      expect(step.gold).toBeGreaterThanOrEqual(last);
      last = step.gold;
    }
    // Variant forms (the Lux origins) are not counted as extra units.
    expect(price.members.every((member) => !member.variantOf)).toBe(true);
  }
});

const chanceText = (page: Page) => page.getByTestId("hit-chance");
const expected = (level: number, gold: number, need: number, slots: number | number[]) => {
  const ahri = unit("Ahri");
  const result = rollDown(
    {
      tierOdds: economy.shopOdds[String(level)]![ahri.cost - 1]! / 100,
      unitCost: ahri.cost,
      copiesLeft: economy.poolSize[ahri.cost - 1]!,
      tierLeft: economy.poolSize[ahri.cost - 1]! * 14,
      need,
      rerollCost: economy.rerollCost,
      slots,
    },
    gold,
  );
  return `${(result.hitByGold[gold]! * 100).toFixed(1)}%`;
};

test("roll page shows the model's number and follows every control", async ({
  page,
}) => {
  const riot: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("api.riotgames.com")) riot.push(request.url());
  });
  await open(page, "/tft");
  await expect(
    page.getByRole("heading", { name: "What does a reroll buy?" }),
  ).toBeVisible();
  await expect(page.locator(".roll-question")).toHaveText(
    "Two-star Ahri with 50 gold at level 8",
  );
  await expect(chanceText(page)).toHaveText(expected(8, 50, 3, economy.slotPattern));
  // The set mechanic is an option, and turning it off changes the result.
  await page.getByRole("checkbox", { name: "Count the set mechanic" }).click();
  await expect(chanceText(page)).toHaveText(expected(8, 50, 3, 5));
  await page.getByRole("checkbox", { name: "Count the set mechanic" }).click();
  // Level by keyboard.
  await page.getByRole("slider", { name: "Level", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".roll-question")).toContainText("at level 9");
  await expect(chanceText(page)).toHaveText(expected(9, 50, 3, economy.slotPattern));
  await expect(page.getByTestId("plan-note")).toContainText("Level 10 costs 68 gold");
  await page.keyboard.press("ArrowLeft");
  // Three-star needs nine copies.
  await page.getByRole("button", { name: "Three-star", exact: true }).click();
  await expect(page.locator(".roll-chance")).toContainText("9 copies");
  await expect(chanceText(page)).toHaveText(expected(8, 50, 9, economy.slotPattern));
  // Contest it until fewer copies remain than are needed.
  const others = page.getByRole("slider", { name: "Copies other players hold" });
  await others.focus();
  for (let press = 0; press < 3; press++) await page.keyboard.press("ArrowRight");
  await expect(page.locator(".roll-chance")).toContainText(
    "Only 7 of the 9 copies you need are left",
  );
  // Another cost, another unit.
  await page.getByRole("button", { name: "1-cost", exact: true }).click();
  await expect(page.locator(".unit-tile")).toHaveCount(14);
  await page.getByRole("button", { name: "Ornn", exact: true }).click();
  await expect(page.locator(".roll-question")).toContainText("Ornn");
  // Lux is left out of this tool, and the page says why.
  await page.getByRole("button", { name: "5-cost", exact: true }).click();
  await expect(page.locator(".unit-tile")).toHaveCount(9);
  await page.locator(".method-details summary").click();
  await expect(page.locator(".method-details")).toContainText("Lux is left out");
  await expect(page.locator(".source-list a")).toHaveCount(
    Object.keys(economy.sources).length,
  );
  await expect(page.locator(".line-chart .chart-line")).toHaveCount(3);
  // With no backend route the page runs on the bundled snapshot and says so.
  await expect(page.locator(".data-status")).toContainText(
    "Bundled snapshot · offline fallback",
  );
  await expect(page.locator(".site-footer")).toContainText(
    "not endorsed by Riot Games",
  );
  expect(riot).toEqual([]); // the browser never talks to Riot's API
});

test("item ledger prices items in components and values them on a chosen unit", async ({
  page,
}) => {
  await open(page, "/tft/items");
  await expect(page.locator(".rate-strip li")).toHaveCount(8);
  await expect(page.locator(".rate-strip")).toContainText("10% attack damage");
  await expect(page.locator(".rate-strip")).toContainText("150 health");
  const rows = page.locator(".ledger-row");
  await expect(rows).toHaveCount(39);
  await expect(rows.first()).toContainText("Blue Buff");
  await expect(rows.first()).toContainText("400%");
  await page.getByRole("combobox", { name: "Sort items by" }).click();
  await page.getByRole("option", { name: "Attack output on this unit" }).click();
  await expect(rows.first()).toContainText("Deathblade");
  await expect(rows.first()).toContainText("+55% attack");
  await rows.first().click();
  const detail = page.locator(".ledger-detail");
  await expect(detail.locator("tbody tr").first()).toContainText("55%");
  await expect(detail.locator("tbody tr").first()).toContainText("5.50");
  await expect(detail).toContainText("Not priced: 1 effect value");
  // A bigger body makes the same belt worth less.
  const belt = page
    .getByRole("figure", { name: /physical damage gained on Ahri/ })
    .locator("li")
    .filter({ hasText: "Giant's Belt" });
  await expect(belt).toContainText("+9.8%");
  await page.getByRole("button", { name: "Three-star", exact: true }).click();
  await expect(belt).toContainText("+5.4%");
});

test("trait prices list every breakpoint and open to the units behind them", async ({
  page,
}) => {
  await open(page, "/tft/traits");
  const prices = priceTraits(set);
  await expect(page.locator(".trait-card")).toHaveCount(prices.length);
  await page
    .getByRole("searchbox", { name: "Find a trait or unit" })
    .fill("Brawler");
  await expect(page.locator(".trait-card")).toHaveCount(1);
  const brawler = prices.find((price) => price.trait.name === "Brawler")!;
  const steps = page.locator(".trait-card .trait-steps li");
  await expect(steps).toHaveCount(brawler.steps.length);
  await expect(steps.first()).toContainText(`${brawler.steps[0]!.gold} gold`);
  await expect(steps.nth(1)).toContainText(
    `+${brawler.steps[1]!.added} on the last step`,
  );
  await page.getByRole("button", { name: /Brawler/ }).click();
  await expect(page.locator(".trait-members li")).toHaveCount(
    brawler.members.length,
  );
  await page.getByRole("searchbox", { name: "Find a trait or unit" }).fill("zzz");
  await expect(page.getByText("No trait or unit matches.")).toBeVisible();
});

test("game review asks for a key, never offers a player search, and labels its example", async ({
  page,
}) => {
  await page.route("**/api/tft/review", (route) =>
    route.fulfill({
      json: { status: "needs_key", missing: ["RIOT_API_KEY", "TFT_REVIEW_RIOT_ID"] },
    }),
  );
  await open(page, "/tft/review");
  await expect(
    page.getByRole("heading", { name: "This needs a Riot API key" }),
  ).toBeVisible();
  await expect(page.locator(".needs-list")).toContainText("RIOT_API_KEY");
  await expect(page.locator(".needs-list")).toContainText("TFT_REVIEW_RIOT_ID");
  await expect(page.locator("#main input")).toHaveCount(0); // no lookup field
  await expect(page.locator(".decision-list")).toHaveCount(0); // nothing shown as data
  await page
    .getByRole("button", { name: "Show an example with invented games" })
    .click();
  await expect(page.getByText("Example data, not a real account")).toBeVisible();
  await expect(page.locator(".decision-list li")).toHaveCount(9);
  await expect(page.locator(".review-table tbody tr")).toHaveCount(12);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);
});

test("game review shows a configured account's result, a Riot failure, and an unreachable service", async ({
  page,
}) => {
  let body: unknown = {
    status: "ready",
    riotId: "Tester#NA1",
    note: "Fixture note.",
    otherSets: 0,
    summary: {
      games: 2,
      topFourGames: 1,
      bottomFourGames: 1,
      averagePlacement: 4.5,
      placements: [0, 1, 0, 0, 0, 0, 1, 0],
      decisions: [
        {
          key: "goldLeft",
          label: "Gold unspent at the end",
          question: "Did you die holding gold you could have rolled?",
          topFour: 2,
          bottomFour: 24,
          difference: -22,
        },
      ],
      goldLeftInBottomFour: 24,
      rerollsUnspentInBottomFour: 12,
    },
    games: [
      { matchId: "NA1_1", playedAt: 1763856000000, placement: 2, level: 9, goldLeft: 2, boardGold: 70, twoStars: 6, threeStars: 0, completedItems: 6, looseComponents: 0 },
      { matchId: "NA1_2", playedAt: 1763852400000, placement: 7, level: 7, goldLeft: 24, boardGold: 41, twoStars: 3, threeStars: 0, completedItems: 4, looseComponents: 2 },
    ],
  };
  let status = 200;
  await page.route("**/api/tft/review", (route) =>
    route.fulfill({ status, json: body }),
  );
  await open(page, "/tft/review");
  await expect(page.getByRole("heading", { name: "Tester#NA1" })).toBeVisible();
  await expect(page.getByText("Calculated from your matches")).toBeVisible();
  await expect(page.locator(".decision-diff")).toContainText("-22.0");
  await expect(page.locator(".insight-metrics")).toContainText(
    "= 12 rerolls not taken",
  );
  await expect(
    page.getByRole("button", { name: "Show an example with invented games" }),
  ).toHaveCount(0);
  body = { status: "error", reason: "Riot rejected the API key. Development keys expire every 24 hours." };
  await page.reload();
  await expect(page.getByText("The review could not be built")).toBeVisible();
  await expect(page.getByText("Development keys expire every 24 hours.")).toBeVisible();
  status = 503;
  await page.reload();
  await expect(
    page.getByText("The review service could not be reached"),
  ).toBeVisible();
});

test("live set data replaces the snapshot, and malformed data does not", async ({
  page,
}) => {
  const live = { ...set, set: { number: 18, name: "Live Fixture Set" } };
  await page.route("**/api/tft/set", (route) => route.fulfill({ json: live }));
  await open(page, "/tft/traits");
  await expect(page.locator(".data-status")).toContainText("Live Fixture Set");
  await expect(page.locator(".data-status")).toContainText("BuildValue API");
  await page.unroute("**/api/tft/set");
  await page.route("**/api/tft/set", (route) =>
    route.fulfill({ json: { set: { number: 19 }, units: [] } }),
  );
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".data-status")).toContainText("Enchanted Wilds");
  await expect(page.locator(".data-status")).toContainText("offline fallback");
  // A set the constants were not checked for is flagged, not passed off.
  await page.unroute("**/api/tft/set");
  const next = {
    ...set,
    set: { number: 19, name: "Set 19" },
    economy: { ...set.economy, verified: false, note: "These constants were checked for set 18, not set 19." },
  };
  await page.route("**/api/tft/set", (route) => route.fulfill({ json: next }));
  await page.reload();
  await expect(
    page.getByText("These constants were checked for a different set"),
  ).toBeVisible();
});

test("the header switches between the two games and pages change with motion on", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open(page, "/items");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "Explore" })).toBeVisible();
  await page.getByRole("group", { name: "Game" }).getByRole("link", { name: "TFT" }).click();
  await expect(page).toHaveURL(/\/tft$/);
  await expect(nav.getByRole("link", { name: "Roll odds" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Explore" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Set 18/ })).toBeVisible();
  await nav.getByRole("link", { name: "Item ledger" }).click();
  await expect(
    page.getByRole("heading", { name: "What is an item's stat line worth?" }),
  ).toBeVisible();
  await expect(page.locator("#main > *")).toHaveCount(1); // the old page is gone
  await page.getByRole("group", { name: "Game" }).getByRole("link", { name: "League" }).click();
  await expect(
    page.getByRole("heading", { name: "Find your next purchase." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^Patch/ })).toBeVisible();
});

for (const width of [390, 768, 1440])
  test(`TFT routes fit and pass accessibility scans at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/tft/review", (route) =>
      route.fulfill({ json: { status: "needs_key", missing: ["RIOT_API_KEY"] } }),
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/tft", "/tft/items", "/tft/traits", "/tft/review"]) {
      await open(page, route);
      if (route === "/tft/items") await page.locator(".ledger-row").first().click();
      if (route === "/tft/traits") await page.locator(".trait-head").first().click();
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
