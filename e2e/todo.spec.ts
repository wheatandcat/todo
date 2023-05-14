import { test, expect } from "@playwright/test";
// @ts-ignore
import { mockDate } from "./mockdate.ts";
import dayjs from "dayjs";

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

test.describe("Markdownの入力した時に、保存されるデータのチェック", () => {
  test("編集してチェックした時のデータが保存されている", async ({ page }) => {
    await mockDate(page, "2023-01-01T00:00:00+09:00");

    await page.getByText("編集").click();
    await page.locator("data-testid=input-markdown").click();
    await page
      .locator("data-testid=input-markdown")
      .fill("- [ ] Task1\n- [ ] Task2\n- [ ] Task3");
    await page.getByText("プレビュー").click();
    await page.locator("data-testid=checkbox-Task1").click();

    const taskListValue = await page.evaluate(() => {
      return localStorage.getItem("taskList");
    });

    const r = JSON.parse(taskListValue ?? "").map((task: any) => ({
      ...task,
      checkedAt: task.checkedAt
        ? dayjs(task.checkedAt).format("YYYY-MM-DDTHH:mm:ss")
        : null,
    }));

    expect(r).toMatchObject([
      {
        checked: true,
        checkedAt: "2023-01-01T00:00:00",
        depth: 3,
        text: "Task1",
      },
      {
        checked: false,
        checkedAt: null,
        depth: 3,
        text: "Task2",
      },
      {
        checked: false,
        checkedAt: null,
        depth: 3,
        text: "Task3",
      },
    ]);
  });
});


test.describe("右クリックで直接履歴に追加", () => {
  test("右クリックで履歴に追加", async ({ page }) => {
    await mockDate(page, "2023-01-01T00:00:00+09:00");

    await page.getByText("編集").click();

    await page.locator("data-testid=input-markdown").click();
    await page
      .locator("data-testid=input-markdown")
      .fill("- [ ] Task1\n- [ ] Task2\n- [ ] Task3");
    await page.getByText("プレビュー").click();
    await page.getByText("Task1").click({
      button: "right",
    });
    await page.getByText('履歴に追加').click();

    await page.getByText("編集").click();
    expect(
      await page.locator("data-testid=input-markdown").inputValue()
    ).toMatch("- [ ] Task2\n- [ ] Task3");

    await page.getByText('履歴').click();

    const paragraph = page.locator("data-testid=history");
    expect(await paragraph.textContent()).toBe("2023年01月01日 00:00Task1");

  });
});
