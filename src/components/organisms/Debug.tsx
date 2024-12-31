import { memo, useState, type FC } from "react";
import type { Task } from "@/lib/task";
import dayjs from "@/lib/dayjs";

type Props = {
  tasks: Task[];
};

const Debug: FC<Props> = (props) => {
  const [checkedData, setCheckedData] = useState(false);
  const [taskName, setTaskName] = useState("");

  const tasks = props.tasks
    .map((task) => {
      return {
        ...task,
        checkedAt: task.checkedAt
          ? dayjs(task.checkedAt).format("YYYY年MM月DD日 HH:mm:ss")
          : null,
      };
    })
    .filter((task) => {
      if (checkedData) {
        return !!task.checkedAt;
      }
      return true;
    })
    .filter((task) => {
      if (taskName) {
        return task.text.includes(taskName);
      }
      return true;
    });

  return (
    <div className="mx-4 pt-3">
      <div className="flex items-center">
        <div className="flex items-center justify-center">
          <div className="pr-2">タスク名:</div>
          <input
            type="text"
            className="border border-gray-300 bg-transparent rounded-md p-1 px-2 text-sm"
            onChange={(e) => setTaskName(e.target.value)}
            aria-Label="filter task name"
          />
        </div>
        <div className="mx-3">|</div>
        <div>
          <input
            type="checkbox"
            id="checkedData"
            onChange={(e) => setCheckedData(e.target.checked)}
          />
          <label htmlFor="checkedData" className="pl-2">
            チェック済みのdataのみ表示
          </label>
        </div>
      </div>
      <div className="border text-left  my-3 history overflow-y-scroll">
        <pre>{JSON.stringify(tasks, null, 2)}</pre>
      </div>
    </div>
  );
};

export default memo(Debug);
