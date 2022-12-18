import React, { memo } from "react";
import Markdown from "markdown-to-jsx";
import { getTaskText } from "../../lib/task";
import Item from "../molecules/Item";
import List from "./List";

type Props = {
  markdown: string;
  onChangeTask: (checked: boolean, taskText: string, nest: string[]) => void;
};

const Preview: React.FC<Props> = ({ markdown, onChangeTask }) => {
  return (
    <div className="border text-left px-5 py-4 mx-4 my-3 board overflow-y-scroll">
      <Markdown
        options={{
          overrides: {
            li: {
              component: (props) => {
                try {
                  if (!props.children) return null;
                  const c0 = props.children[0];

                  if (typeof c0 === "string") {
                    return <li>{props.children}</li>;
                  }

                  const checked = c0.props.checked;

                  let last = props.children.at(-1);
                  let nest: string[] = [];

                  if (typeof last !== "string" && last.type === "ul") {
                    nest = last.props.children.map(
                      (v: any) => v.props.children[0]
                    );
                  }

                  let taskText = props.children[1]
                    .replaceAll("\n", "")
                    .replaceAll(" ", "");

                  if (last.type === "a") {
                    taskText = getTaskText(last);
                  }

                  const id: string = `checkbox-${taskText}`;

                  const isLink = last.type === "a";

                  if (!taskText || taskText === "") {
                    throw new Error("taskText is empty:", taskText);
                  }

                  return (
                    <li {...props}>
                      <div className="flex items-center">
                        <div className="pr-2 pt-1">
                          <input
                            id={id}
                            type="checkbox"
                            defaultChecked={checked}
                            aria-labelledby="task item"
                            readOnly={false}
                            onChange={() => {
                              onChangeTask(checked, taskText, nest);
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor={id}>
                            <span>
                              {isLink ? (
                                <a href={taskText} target="_blank">
                                  {taskText}
                                </a>
                              ) : (
                                taskText
                              )}
                            </span>
                          </label>
                        </div>
                      </div>
                      {nest.map((v: string, index: number) => (
                        <List key={index}>{v}</List>
                      ))}
                    </li>
                  );
                } catch (e) {
                  console.log("props", props);
                  console.log("エラー内容", e);

                  return (
                    <div>
                      <span className="text-red-600 font-bold text-sm underline underline-offset-2">
                        ・☠️ パースに失敗しました{" "}
                      </span>
                      <span className="text-white text-sm font-normal">
                        （元: {props.children}）
                      </span>
                    </div>
                  );
                }
              },
            },
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
};

export default memo(Preview);
