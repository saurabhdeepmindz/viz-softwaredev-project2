import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOTS = path.resolve(__dirname, "../screenshots");

test.describe("Task 6: Processing page", () => {
  test("task6-01: /processing renders without crashing and shows progress UI", async ({ page }) => {
    await page.goto("/processing?jobId=fake-job-id");
    await page.screenshot({ path: path.join(SCREENSHOTS, "task6-01-processing-page.png") });

    // Should show some status/progress content
    await expect(page.getByTestId("processing-container")).toBeVisible();
    await expect(page.getByTestId("progress-feed")).toBeVisible();
  });

  test("task6-02: progress feed shows animated step messages", async ({ page }) => {
    await page.goto("/processing?jobId=fake-job-id");
    await page.screenshot({ path: path.join(SCREENSHOTS, "task6-02-progress-steps.png") });
    // At least one step message visible
    const steps = page.getByTestId("progress-step");
    await expect(steps.first()).toBeVisible();
  });

  test("task6-03: page shows a meaningful title/heading", async ({ page }) => {
    await page.goto("/processing?jobId=fake-job-id");
    await expect(page.getByTestId("processing-heading")).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS, "task6-03-processing-heading.png") });
  });
});
