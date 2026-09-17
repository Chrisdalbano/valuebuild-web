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
        path: `test-results/vantage-${theme}-${width}.png`,
        fullPage: true,
      });
    }
  });
}
test("dialog accessibility and focus containment", async ({ page }) => {
  await page.goto("/ui-kit.html");
  await page.getByRole("button", { name: /^Save a build/ }).click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
