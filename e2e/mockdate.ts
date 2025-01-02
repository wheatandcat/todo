import type { Page } from "@playwright/test";

export const mockDate = async (page: Page, dateString: string) => {
  const mockedDate = new Date(dateString);
  const mockedTimestamp = mockedDate.getTime();

  await page.evaluate((mockedTimestamp) => {
    const OriginalDate = Date;
    class MockDate extends Date {
      // @ts-ignore
      constructor(...args) {
        if (args.length === 0) {
          super(mockedTimestamp);
        } else {
          // @ts-ignore
          super(...args);
        }
      }

      static now() {
        return mockedTimestamp;
      }
    }

    // @ts-ignore
    Date = MockDate;
    Date;
    Object.setPrototypeOf(MockDate, OriginalDate);
    MockDate.prototype = OriginalDate.prototype;
  }, mockedTimestamp);
};
