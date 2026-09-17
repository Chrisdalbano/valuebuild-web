import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("library interactions and keyboard contracts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/ui-kit.html");
  await page.getByRole("switch", { name: "Show precise values" }).click();
  await expect(
    page.getByRole("switch", { name: "Show precise values" }),
  ).toHaveAttribute("aria-checked", "false");
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Statistics", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: /^Save a build/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Save build", exact: true }),
  ).toBeDisabled();
  await dialog.getByLabel("Build name").fill("Test build");
  await dialog.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Save a build/ }),
  ).toBeFocused();
  await page.getByLabel("Search sample items").fill("unknown");
  await expect(page.getByText("No items match.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("button", { name: "Compare Hollowguard", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare Stormthread", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Compare Cinderwake", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Compare items", exact: false })
    .click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("8,600")).toBeVisible();
  await expect(dialog.getByText("110.8%")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});
for (const width of [390, 768, 1440]) {
  test(`responsive and accessible at ${width}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/ui-kit.html");
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ["ink", "paper"]) {
      if (theme === "paper")
        await page
          .getByRole("button", { name: "Paper theme", exact: false })
          .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
      await page.screenshot({
        path: `test-results/forza-${theme}-${width}.png`,
        fullPage: true,
      });
    }
  });
}
test("dialog accessibility and focus containment", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui-kit.html");
  await page.getByRole("button", { name: /^Save a build/ }).click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest("[role=dialog]"),
      ),
    ).toBe(true);
  }
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("list motion preserves identity across create, remove, undo and reorder", async ({
  page,
}) => {
  await page.goto("/ui-kit.html");
  const list = page.getByRole("list", { name: "Saved builds", exact: true });
  await expect(list.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "New build", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Build name").fill("Split push");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save build", exact: true })
    .click();
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await page.getByRole("button", { name: "Reverse order" }).click();
  await expect(list.getByRole("listitem").first()).toContainText("Split push");
  await page.getByRole("button", { name: "Delete Split push" }).click();
  await expect(list.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list.getByRole("listitem").first()).toContainText("Split push");
});
test("single input focus treatment and icons stay in their frames", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ui-kit.html");
  const input = page.getByLabel("Search sample items");
  await input.focus();
  const focus = await input.evaluate((el) => ({
    outline: getComputedStyle(el).outlineStyle,
    shadow: getComputedStyle(el).boxShadow,
    border: getComputedStyle(el).borderWidth,
  }));
  expect(focus).toEqual({ outline: "none", shadow: "none", border: "0px" });
  for (const icon of await page.locator(".item-icon svg").all()) {
    const fits = await icon.evaluate((el) => {
      const a = el.getBoundingClientRect(),
        b = el.parentElement!.getBoundingClientRect();
      return (
        a.left >= b.left &&
        a.right <= b.right &&
        a.top >= b.top &&
        a.bottom <= b.bottom
      );
    });
    expect(fits).toBe(true);
  }
});
test("reduced motion applies to dialogs and reactive lists", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui-kit.html");
  await page.getByRole("button", { name: "New build", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Reverse order" }).click();
  expect(
    await page
      .getByRole("list", { name: "Saved builds", exact: true })
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
});
test("dialog exit stays mounted until motion completes and can reopen", async ({
  page,
}) => {
  await page.goto("/ui-kit.html");
  await page.getByRole("button", { name: "New build", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".fz-dialog[data-state=closed]")).toHaveCount(1);
  await expect(page.locator(".fz-dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "New build", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "New build", exact: true }),
  ).toBeFocused();
});
