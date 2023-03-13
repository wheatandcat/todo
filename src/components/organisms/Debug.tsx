import React, { memo } from "react";
import { Task } from "../../lib/task";
import dayjs from "../../lib/dayjs";

type Props = {
  tasks: Task[];
};

const Debug: React.FC<Props> = (props) => {
  const tasks = props.tasks.map((task) => {
    return {
      ...task,
      checkedAt: dayjs(task.checkedAt).format("YYYY年MM月DD日 HH:mm:ss"),
    };
  });

  return (
    <div className="border text-left mx-4 my-3 history overflow-y-scroll">
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
};

export default memo(Debug);
