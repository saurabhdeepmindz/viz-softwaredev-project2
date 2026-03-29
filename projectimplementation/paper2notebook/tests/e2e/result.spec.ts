import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOTS = path.resolve(__dirname, "../screenshots");

test.describe("Task 7: Result page", () => {
  test("task7-01: /result renders with download and colab buttons", async ({ page }) => {
    await page.goto("/result?jobId=fake-job-id");
    await page.screenshot({ path: path.join(SCREENSHOTS, "task7-01-result-page.png") });

    await expect(page.getByTestId("result-container")).toBeVisible();
    await expect(page.getByTestId("download-button")).toBeVisible();
    await expect(page.getByTestId("colab-button")).toBeVisible();
  });

  test("task7-02: download button exists and is clickable", async ({ page }) => {
    await page.goto("/result?jobId=fake-job-id");
    const btn = page.getByTestId("download-button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await page.screenshot({ path: path.join(SCREENSHOTS, "task7-02-download-button.png") });
  });

  test("task7-03: open in colab button exists and is clickable", async ({ page }) => {
    await page.goto("/result?jobId=fake-job-id");
    const btn = page.getByTestId("colab-button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await page.screenshot({ path: path.join(SCREENSHOTS, "task7-03-colab-button.png") });
  });
});
