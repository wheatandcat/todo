import { useState, useCallback, useEffect } from "react";
import { Node } from "unist-util-visit";
import { unified, VFileWithOutput } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import Tabs from "./components/organisms/Tabs";
import History from "./components/organisms/History";
import Preview from "./components/organisms/Preview";
import Debug from "./components/organisms/Debug";
import dayjs from "./lib/dayjs";
import {
  Task,
  getTasks,
  getHistory,
  removeHistoryInMarkdown,
} from "./lib/task";
import { STORAGE_KEY, getJsonParse } from "./lib/storage";
import useListen from "./hooks/useListen";
import { getItemText } from "./lib/text";
import AppIcon from "./assets/icon.png";
import "./App.css";
import "./index.css";

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
      console.log("h:", h);
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
        const text = getItemText(v.text);
        if (text === taskText) {
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
          const checkItems = v.split("[x]");
          if (checkItems.length === 2) {
            const text = getItemText(checkItems[1]);
            return checkItems[0] + "[x] " + text;
          }
          const unCheckItems = v.split("[ ]");
          if (unCheckItems.length === 2) {
            const text = getItemText(unCheckItems[1]);
            return unCheckItems[0] + "[ ] " + text;
          }
          return v;
        })
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
      <div className="text-2xl font-bold text-left px-4 pb-3 flex logo">
        <img src={AppIcon} className="inline-block w-8 h-8 mr-2" alt="logo" />
        <div className="pt-1">TODO LIST</div>
      </div>
      <Tabs
        items={["プレビュー", "編集", "履歴", "データ確認"]}
        selectedIndex={select}
        onSelect={setSelect}
      />

      {(() => {
        if (select === 0) {
          return <Preview markdown={markdown} onChangeTask={onChangeTask} />;
        } else if (select === 1) {
          return (
            <div className="border text-left mx-4 my-3 board">
              <textarea
                className="bg-inherit w-full h-full px-4 py-4 board"
                aria-label="markdown"
                data-testid="input-markdown"
                onChange={(e) => handleChange(e)}
                defaultValue={markdown}
              />
            </div>
          );
        } else if (select === 2) {
          return (
            <History
              items={history.sort((a, b) =>
                dayjs(a.checkedAt).isBefore(dayjs(b.checkedAt)) ? 1 : -1
              )}
            />
          );
        } else {
          return <Debug tasks={tasks} />;
        }
      })()}
    </div>
  );
}

export default App;
