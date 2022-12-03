import React, { memo } from "react";
import Markdown from "markdown-to-jsx";

type Props = {
  markdown: string;
  onChangeTask: (checked: boolean, taskText: string) => void;
};

const Preview: React.FC<Props> = ({ markdown, onChangeTask }) => {
  return (
    <div className="border text-left px-5 py-4 mx-4 my-3 min-h-96">
      <Markdown
        options={{
          overrides: {
            li: {
              component: (props) => {
                if (!props.children) return null;
                const c0 = props.children[0];

                if (typeof c0 === "string") {
                  return <li>{props.children}</li>;
                }

                const checked = c0.props.checked;
                const taskText = props.children[1];

                const id: string = `checkbox-${taskText}`;

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
                            onChangeTask(checked, taskText);
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor={id}>
                          <span>{taskText}</span>
                        </label>
                      </div>
                    </div>
                  </li>
                );
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
