import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("初期画面の確認", async ({ page }) => {
  await expect(page).toHaveTitle(/todo/);
});

test.describe("Markdownの入力テスト", () => {
  test("プレビューにチェックでMarkdownにチェックが付く", async ({ page }) => {
    await page.getByText("編集").click();
    await page.locator("data-testid=input-markdown").click();
    await page
      .locator("data-testid=input-markdown")
      .fill("- [ ] Task1\n- [ ] Task2");
    await page.getByText("プレビュー").click();
    await page.locator("data-testid=checkbox-Task1").click();

    expect(
      await page.locator("data-testid=checkbox-Task1").isChecked()
    ).toBeTruthy();

    await page.getByText("編集").click();

    expect(
      await page.locator("data-testid=input-markdown").inputValue()
    ).toMatch("- [x] Task1\n- [ ] Task2");
  });
});
