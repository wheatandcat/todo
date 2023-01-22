import { unified, VFileWithOutput } from "unified";
import { Node } from "unist-util-visit";
import { describe, it, expect } from "vitest";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { getTasks } from "./task";
import { Task } from "../App";

var tasks: Task[] = [
  {
    text: "Task 3",
    depth: 4,
    checked: false,
    checkedAt: null,
    nest: ["Task 3-1"],
  },
];

function remarkTasks() {
  return (node: Node, file: VFileWithOutput<any>) => {
    file.data.taskList = getTasks(node, tasks);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkTasks);

describe("src/lib/task.ts", () => {
  it.each([
    {
      name: "消化タスクあり",
      markdown: `
 - [ ] Task 1
 - [x] Task 2
  `,
      expected: [
        { text: "Task 1", depth: 4, checked: false, checkedAt: null },
        { text: "Task 2", depth: 4, checked: true, checkedAt: null },
      ],
    },
    {
      name: "nestあり",
      markdown: `
 - [ ] Task 3
  - Task 3-1
  `,
      expected: [
        {
          text: "Task 3",
          depth: 4,
          checked: false,
          checkedAt: null,
          nest: ["Task 3-1"],
        },
      ],
    },
  ])("Markdownからタスクを取得（$name）", ({ markdown, expected }) => {
    const file = processor.processSync(markdown);

    expect(file.data.taskList).toEqual(expected);
  });
});
