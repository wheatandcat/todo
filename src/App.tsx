import { useState, useCallback, useEffect } from "react";
import { Node } from "unist-util-visit";
import { unified, VFileWithOutput } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import Tabs from "./components/organisms/Tabs";
import History from "./components/organisms/History";
import Preview from "./components/organisms/Preview";
import dayjs from "./lib/dayjs";
import { getTasks, getHistory, removeHistoryInMarkdown } from "./lib/task";
import { STORAGE_KEY, getJsonParse } from "./lib/storage";
import useListen from "./hooks/useListen";
import "./App.css";
import "./index.css";

export type Task = {
  depth: number;
  text: string;
  checked: boolean;
  nest?: string[];
  checkedAt: string | null;
};

var tasks: Task[] = getJsonParse(STORAGE_KEY.TASK_LIST);

function remarkTasks() {
  return (node: Node, file: VFileWithOutput<any>) => {
    file.data.taskList = getTasks(node, tasks);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkTasks);

function App() {
  const [select, setSelect] = useState(0);
  const [markdown, setMarkdown] = useState(
    localStorage.getItem(STORAGE_KEY.MARKDOWN) || ""
  );

  const [history, setHistory] = useState<Task[]>(
    getJsonParse(STORAGE_KEY.HISTORY)
  );

  useListen({
    onImportCallback: (markdown, tTasks, history) => {
      setMarkdown(markdown);
      setHistory(history);
      tasks = tTasks;
    },
  });

  const addHistoryValue = useCallback(
    (markdownValue: string, tTasks: Task[]) => {
      const h = getHistory(tTasks);
      if (h.length === 0) {
        return;
      }

      setHistory((v) => {
        const items = [...(v ?? []), ...h];
        localStorage.setItem(STORAGE_KEY.HISTORY, JSON.stringify(items));
        return items;
      });

      const historyTextList = h.map((v) => v.text);

      tasks = tTasks.filter((v) => {
        return !historyTextList.includes(v.text);
      });
      localStorage.setItem(STORAGE_KEY.TASK_LIST, JSON.stringify(tasks));

      const nestText = tTasks
        .filter((v) => {
          return historyTextList.includes(v.text);
        })
        .map((v) => {
          return v.nest ?? [];
        })
        .flat();

      const m = removeHistoryInMarkdown(
        markdownValue,
        historyTextList,
        nestText
      );

      setMarkdown(m);
      localStorage.setItem(STORAGE_KEY.MARKDOWN, m);
    },
    [history]
  );

  const setValue = useCallback((value: string) => {
    setMarkdown(value);
    localStorage.setItem(STORAGE_KEY.MARKDOWN, value);

    const file = processor.processSync(value);

    const ts = file.data.taskList as Task[];
    localStorage.setItem(STORAGE_KEY.TASK_LIST, JSON.stringify(ts));

    tasks = ts;
    addHistoryValue(value, tasks);
  }, []);

  useEffect(() => {
    setValue(markdown);
  }, [markdown]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setValue(value);

      setMarkdown(value);
    },
    []
  );

  const onChangeTask = useCallback(
    (checked: boolean, taskText: string, nest: string[]) => {
      tasks = tasks.map((v) => {
        if (v.text === taskText.trim()) {
          v.nest = nest;
          // この時点ではチェックが入っていないので、チェックが入っているときはチェックが入った日時を記録する
          if (!checked) {
            v.checkedAt = dayjs().add(0, "day").toString();
          } else {
            v.checkedAt = null;
          }
        }

        return v;
      });

      const m = markdown
        .split("\n")
        .map((v) => {
          if (v.includes(taskText)) {
            if (checked) {
              return v.replace("[x]", "[ ]");
            } else {
              return v.replace("[ ]", "[x]");
            }
          }
          return v;
        })
        .join("\n");

      setMarkdown(m);
    },
    [markdown]
  );

  return (
    <div className="pt-4 max-w-screen-lg">
      <div className="text-3xl font-bold text-left px-4 pb-3">TODO LIST</div>
      <Tabs
        items={["プレビュー", "編集", "履歴"]}
        selectedIndex={select}
        onSelect={setSelect}
      />

      {(() => {
        if (select === 0) {
          return <Preview markdown={markdown} onChangeTask={onChangeTask} />;
        } else if (select === 1) {
          return (
            <div className="border text-left mx-4 my-3 h-96">
              <textarea
                className="bg-inherit w-full h-full px-4 py-4"
                aria-label="markdown"
                onChange={(e) => handleChange(e)}
                defaultValue={markdown}
              />
            </div>
          );
        } else {
          return (
            <History
              items={history.sort((a, b) =>
                dayjs(a.checkedAt).isBefore(dayjs(b.checkedAt)) ? 1 : -1
              )}
            />
          );
        }
      })()}
    </div>
  );
}

export default App;
