import { ListItem, Paragraph, Text } from "mdast";
import { Node, visit } from "unist-util-visit";

export type Task = {
  depth: number;
  text: string;
  checked: boolean;
  checkedAt: string | null;
};

export const getTasks = (root: Node, tTasks: Task[]) => {
  const items: Task[] = [];

  visit(root, "listItem", (node: ListItem) => {
    const paragraph = node.children.find((v) => v.type === "paragraph");
    if (!paragraph) return;

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
      (v) => v.text.trim() === item.text.trim()
    )?.checkedAt;
    if (checkedAt) {
      item.checkedAt = checkedAt;
    }

    items.push(item);
  });

  return items;
};
