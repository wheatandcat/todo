import { useState, useCallback, useEffect } from "react";
import { Node } from "unist-util-visit";
import { unified, VFileWithOutput } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import Tabs from "./components/organisms/Tabs";
import History from "./components/organisms/History";
import Editor from "./components/organisms/Editor";
import dayjs from "./lib/dayjs";
import { getTasks } from "./lib/task";
import { STORAGE_KEY, getJsonParse } from "./lib/storage";
import { dialog } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import "./index.css";

export type Task = {
  depth: number;
  text: string;
  checked: boolean;
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

  const [history, setHistory] = useState(getJsonParse(STORAGE_KEY.HISTORY));

  useEffect(() => {
    let unlisten: any;
    async function f() {
      unlisten = await listen<string>("about", () => {
        dialog.message("Copyright © 2022 wheatandcat", "This is a todo app.");
      });
    }
    f();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const addHistoryValue = useCallback((tasks: Task[]) => {
    const h = tasks.filter((v) => {
      if (!v.checkedAt) {
        return false;
      }

      return dayjs().diff(dayjs(v.checkedAt), "hour") > 12;
    });

    if (h.length === 0) {
      return;
    }

    const items = [...(history ?? []), ...h];

    setHistory(items);
    localStorage.setItem(STORAGE_KEY.HISTORY, JSON.stringify(items));

    const historyTextList = h.map((v) => v.text);

    tasks = tasks.filter((v) => {
      return !historyTextList.includes(v.text);
    });
    localStorage.setItem(STORAGE_KEY.TASK_LIST, JSON.stringify(tasks));

    const m = markdown
      .split("\n")
      .filter((v) => {
        const ng = historyTextList.find((t) => v.includes(t));

        return !ng;
      })
      .join("\n");

    setMarkdown(m);
    localStorage.setItem(STORAGE_KEY.MARKDOWN, m);
  }, []);

  const setValue = useCallback((value: string) => {
    setMarkdown(value);
    localStorage.setItem(STORAGE_KEY.MARKDOWN, value);

    const file = processor.processSync(value);
    const ts = file.data.taskList as Task[];
    localStorage.setItem(STORAGE_KEY.TASK_LIST, JSON.stringify(ts));

    tasks = ts;
    addHistoryValue(tasks);
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

  const onChangeTask = useCallback((checked: boolean, taskText: string) => {
    tasks = tasks.map((v) => {
      if (v.text === taskText.trim()) {
        // この時点ではチェックが入っていないので、チェックが入っているときはチェックが入った日時を記録する
        if (!checked) {
          v.checkedAt = dayjs().toString();
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
  }, []);

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
          return <Editor markdown={markdown} onChangeTask={onChangeTask} />;
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
          return <History items={history} />;
        }
      })()}
    </div>
  );
}

export default App;
