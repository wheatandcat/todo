export const STORAGE_KEY = {
  TASK_LIST: "taskList",
  MARKDOWN: "markdown",
  HISTORY: "history",
};

export const getJsonParse = (key: string) => {
  return JSON.parse(String(localStorage.getItem(key))) || [];
};
