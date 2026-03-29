import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOTS = path.resolve(__dirname, "../screenshots");

test.describe("Task 2: Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("task2-01: page loads with correct title and hero text", async ({
    page,
  }) => {
    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-01-landing-loaded.png"),
    });

    await expect(page).toHaveTitle(/Paper2Notebook/);
    await expect(
      page.getByTestId("hero-heading")
    ).toContainText("research paper");
  });

  test("task2-02: API key input is masked and has eye toggle", async ({
    page,
  }) => {
    const input = page.getByTestId("api-key-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "password");

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-02-api-key-masked.png"),
    });

    // Toggle to show
    await page.getByTestId("api-key-toggle").click();
    await expect(input).toHaveAttribute("type", "text");

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-02b-api-key-visible.png"),
    });
  });

  test("task2-03: generate button disabled until both fields filled", async ({
    page,
  }) => {
    const btn = page.getByTestId("generate-button");

    // Initially disabled
    await expect(btn).toBeDisabled();

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-03-button-disabled-empty.png"),
    });

    // Fill API key only — still disabled
    await page.getByTestId("api-key-input").fill("sk-test-key-1234567890");
    await expect(btn).toBeDisabled();

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-03b-button-disabled-no-pdf.png"),
    });
  });

  test("task2-04: PDF dropzone is visible and accepts only PDF", async ({
    page,
  }) => {
    const dropzone = page.getByTestId("pdf-dropzone");
    await expect(dropzone).toBeVisible();
    await expect(dropzone).toContainText(/PDF/i);

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-04-dropzone-visible.png"),
    });

    // Upload a PDF file
    const fileInput = page.locator('input[type="file"]');
    // Create a minimal fake PDF buffer for test
    const fakePdf = Buffer.from("%PDF-1.4 fake pdf content for testing");
    const tmpPath = path.join(SCREENSHOTS, "test-paper.pdf");
    fs.writeFileSync(tmpPath, fakePdf);

    await fileInput.setInputFiles(tmpPath);

    // Dropzone should show filename after upload
    await expect(dropzone).toContainText("test-paper.pdf");

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-04b-dropzone-file-selected.png"),
    });
  });

  test("task2-05: button enables when both API key and PDF are provided", async ({
    page,
  }) => {
    const btn = page.getByTestId("generate-button");
    await expect(btn).toBeDisabled();

    await page.getByTestId("api-key-input").fill("sk-test-key-1234567890");

    const fakePdf = Buffer.from("%PDF-1.4 fake pdf content");
    const tmpPath = path.join(SCREENSHOTS, "test-paper.pdf");
    fs.writeFileSync(tmpPath, fakePdf);

    await page.locator('input[type="file"]').setInputFiles(tmpPath);

    await expect(btn).toBeEnabled();

    await page.screenshot({
      path: path.join(SCREENSHOTS, "task2-05-button-enabled.png"),
    });
  });
});
