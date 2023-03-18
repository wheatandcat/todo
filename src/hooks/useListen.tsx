import { useEffect } from "react";
import { STORAGE_KEY, getJsonParse } from "../lib/storage";
import { dialog } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { save, open } from "@tauri-apps/api/dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/api/fs";
import { Task } from "../lib/task";

type Props = {
  onImportCallback: (markdown: string, tasks: Task[], history: Task[]) => void;
};

const useListen = (props: Props) => {
  useEffect(() => {
    let unListenAbout: any;
    let unListenExport: any;
    let unListenImport: any;
    async function f() {
      unListenAbout = await listen<string>("about", () => {
        dialog.message("Copyright © 2022 wheatandcat", "This is a todo app.");
      });
      unListenExport = await listen<string>("export", async () => {
        const m = localStorage.getItem(STORAGE_KEY.MARKDOWN) || "";
        const h = getJsonParse(STORAGE_KEY.HISTORY);
        const t = getJsonParse(STORAGE_KEY.TASK_LIST);
        const data = {
          markdown: m,
          history: h,
          tasks: t,
        };

        const path = await save({ defaultPath: "export-todo.json" });
        if (path) {
          writeTextFile(path, JSON.stringify(data));
        }
      });
      unListenImport = await listen<string>("import", async () => {
        const path = await open();
        if (path) {
          const dataText = await readTextFile(String(path));
          const data: any = JSON.parse(dataText);

          localStorage.setItem(STORAGE_KEY.MARKDOWN, data.markdown);
          localStorage.setItem(
            STORAGE_KEY.HISTORY,
            JSON.stringify(data.history)
          );
          localStorage.setItem(
            STORAGE_KEY.TASK_LIST,
            JSON.stringify(data.tasks)
          );

          props.onImportCallback(data.markdown, data.tasks, data.history);
        }
      });
    }
    f();

    return () => {
      if (unListenAbout) {
        unListenAbout();
      }
      if (unListenExport) {
        unListenExport();
      }
      if (unListenImport) {
        unListenImport();
      }
    };
  }, []);

  return {};
};

export default useListen;
