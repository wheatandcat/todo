import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import History from "./History";

describe("src/components/organisms/History.tsx", () => {
  test("履歴を表示", () => {
    const props = {
      items: [
        {
          depth: 1,
          text: "Task 1",
          checked: false,
          checkedAt: null,
        },
      ],
    };
    render(<History {...props} />);

    expect(screen.getByText(/Task 1/i)).toBeTruthy();
  });
});
