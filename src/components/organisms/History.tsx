import React, { memo } from "react";
import { Task } from "../../App";
import List from "./List";
import dayjs from "../../lib/dayjs";

type Props = {
  items: Task[];
};

const History: React.FC<Props> = (props) => {
  return (
    <div className="border text-left mx-4 my-3 history overflow-y-scroll">
      {props.items.map((item, index) => (
        <div key={index} className="m-3 pt-1">
          <div className="text-xs p">
            {dayjs(item.checkedAt).format("YYYY年MM月DD日 HH:mm")}
          </div>
          <div className="text-base font-bold py-2">{item.text}</div>
          {(item.nest ?? []).length > 0 && (
            <ul className="text-base font-bold pb-2">
              {(item.nest ?? []).map((v, index) => (
                <List key={index} text={v} />
              ))}
            </ul>
          )}

          {props.items.length - 1 !== index && (
            <div className="border-b pt-1" />
          )}
        </div>
      ))}
    </div>
  );
};

export default memo(History);
