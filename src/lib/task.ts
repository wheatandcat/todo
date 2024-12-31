import type { ListItem, Paragraph, Text } from "mdast";
import { visit } from "unist-util-visit";
import dayjs from "./dayjs";
import { getItemText } from "./text";

export type Task = {
  depth: number;
  text: string;
  checked: boolean;
  nest?: string[];
  checkedAt: string | null;
  directHistory?: boolean;
};

export const getTasks = (root: any, tTasks: Task[]) => {
  const items: Task[] = [];

  visit(root, "listItem", (node: ListItem) => {
    const paragraph = node.children.find((v) => v.type === "paragraph");
    if (!paragraph) {
      console.log("out:", paragraph);
      return;
    }

    const text = (paragraph as Paragraph).children.find(
      (v) => v.type === "text"
    ) as Text;
    if (!text || !text.value) return;

    const checked = text.value.includes("[x]");
    if (!checked) {
      if (!text.value.includes("[ ]")) return;
    }

    const item: Task = {
      text: "",
      depth: paragraph.position?.start?.column || 0,
      checked,
      checkedAt: null,
    };

    if (checked) {
      item.text = text.value.replace("[x]", "").trim();
    } else {
      item.text = text.value.replace("[ ]", "").trim();
    }

    const checkedAt = tTasks.find(
      (v) => getItemText(v.text) === getItemText(item.text)
    )?.checkedAt;
    if (checkedAt) {
      item.checkedAt = checkedAt;
    }

    const nest =
      tTasks.find((v) => v.text.trim() === item.text.trim())?.nest ?? [];
    if (nest.length > 0) {
      item.nest = nest;
    }

    items.push(item);
  });

  console.log("items:", items);

  return items;
};

export const getHistory = (tTasks: Task[]) => {
  const h = tTasks.filter((v) => {
    if (!v.checkedAt) {
      return false;
    }

    if (dayjs().diff(dayjs(v.checkedAt), "hour") > 12) {
      return true;
    }

    if (v.directHistory) {
      return true;
    }

    return false;
  });

  return h;
};

export const removeHistoryInMarkdown = (
  markdownValue: string,
  historyTextList: string[],
  nestText: string[]
) => {
  const m = markdownValue
    .split("\n")
    .filter((v) => {
      if (["[x]", "[ ]"].find((t) => v.includes(t))) {
        if (historyTextList.find((t) => v.includes(t))) {
          return false;
        }
      } else {
        if (nestText.find((t) => v.includes(t))) {
          return false;
        }
      }
      return true;
    })
    .join("\n");

  return m;
};

export const getTaskText = (v: any): string => {
  if (v.type === "a") {
    return v.props.children[0].replaceAll("\n", "").replaceAll(" ", "");
  }

  return v;
};
