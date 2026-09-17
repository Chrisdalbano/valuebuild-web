import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui-kit.html");
});
test("build workflow coordinates controlled inputs", async ({ page }) => {
  const workflow = page.locator(".library-demo").nth(0);
  await expect(
    workflow.getByRole("button", { name: "Continue" }),
  ).toBeDisabled();
  await workflow.getByRole("combobox").click();
  await page.getByRole("option", { name: "Duelist" }).click();
  await workflow.getByRole("button", { name: "Continue" }).click();
  const slider = workflow.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "3500");
  await workflow.getByRole("checkbox").check();
  await workflow.getByRole("button", { name: "Continue" }).click();
  await expect(workflow.locator(".fz-alert")).toContainText("3,500 gold");
});
test("overlays select actions and restore focus", async ({ page }) => {
  const trigger = page.getByRole("button", {
    name: "Build actions",
    exact: true,
  });
  await trigger.click();
  await page.getByRole("menuitem", { name: "Duplicate build" }).click();
  await expect(page.locator(".demo-feedback")).toHaveText("Build duplicated");
  await expect(trigger).toBeFocused();
  await page
    .getByRole("button", { name: "How filters work", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "How filters work" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const filters = page.getByRole("button", { name: "Open build filters" });
  await filters.click();
  const drawer = page.getByRole("dialog", { name: "Build filters" });
  await drawer.getByRole("combobox").click();
  await page.getByRole("option", { name: "Team builds", exact: true }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: "test-results/forza-drawer.png" });
  await drawer.getByRole("button", { name: "Apply filters" }).click();
  await expect(drawer).not.toBeVisible();
  await expect(filters).toBeFocused();
  await expect(page.locator(".demo-feedback")).toHaveText("Team builds");
});
test("carousel and accordion support discrete navigation", async ({ page }) => {
  const carousel = page.getByRole("region", { name: "Build archetypes" });
  await carousel.getByRole("button", { name: "Next slide" }).click();
  await expect(carousel.getByRole("group", { name: "2 of 3" })).toBeVisible();
  await expect(carousel.getByText("Hold the line.")).not.toBeInViewport();
  const accordion = page.getByRole("button", {
    name: "How should I compare options?",
  });
  await accordion.click();
  await expect(accordion).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Compare trade-offs within the same budget.", {
      exact: false,
    }),
  ).toBeVisible();
  await accordion.press("Enter");
  await expect(accordion).toHaveAttribute("aria-expanded", "false");
});
test("table sorts filters and paginates in the parent", async ({ page }) => {
  const catalog = page.locator(".library-demo").nth(3);
  await catalog.getByRole("button", { name: "Gold", exact: false }).click();
  await expect(catalog.locator("tbody tr").first()).toContainText("Swiftfang");
  await catalog.getByRole("button", { name: "Next page" }).click();
  await expect(
    catalog.getByRole("button", { name: "Page 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await catalog.getByLabel("Find an item").fill("moon");
  await expect(catalog.locator("tbody tr")).toHaveCount(1);
  await expect(catalog.locator("tbody")).toContainText("Moonwell");
  await expect(
    catalog.getByRole("button", { name: "Page 1", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});
test("landing scroll choreography cleans up when reduced motion changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(".motion-stage").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".scroll-progress")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe("matrix(0, 0, 0, 1, 0, 0)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".scroll-progress")).toBeHidden();
  await expect
    .poll(() =>
      page
        .locator(".motion-tile")
        .first()
        .evaluate((el) => el.style.transform),
    )
    .toBe("");
});
