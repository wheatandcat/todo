import { memo, type FC } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { Task } from "@/lib/task";
import dayjs from "@/lib/dayjs";
import Item from "@/components/molecules/Item";
import List from "@/components/organisms/List";

type Props = {
  items: Task[];
};

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <p className="text-red-600 font-bold text-sm underline underline-offset-2">
        ☠️ パースに失敗しました:
      </p>
      <pre>{error.message}</pre>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

const History: FC<Props> = (props) => {
  return (
    <div
      className="border text-left mx-4 my-3 history overflow-y-scroll"
      data-testid="history"
    >
      {props.items.map((item, index) => {
        return (
          <div key={index} className="m-3 pt-1">
            <div className="text-xs p">
              {dayjs(item.checkedAt).format("YYYY年MM月DD日 HH:mm")}
            </div>
            <div className="text-base font-bold py-2">
              <Item value={item.text} />
            </div>
            {(item?.nest ?? []).length > 0 && (
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onReset={() => {
                  // reset the state of your app so the error doesn't happen again
                }}
              >
                <ul className="text-base font-bold pb-2">
                  {(item?.nest ?? []).map((v, index) => {
                    return (
                      <List key={index}>
                        <Item type={(v as any).type || ""} value={v} />
                      </List>
                    );
                  })}
                </ul>
              </ErrorBoundary>
            )}

            {props.items.length - 1 !== index && (
              <div className="border-b pt-1" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default memo(History);
