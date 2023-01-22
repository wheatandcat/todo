import { action, observable } from "mobx";

export type Task = {
  depth: number;
  text: string;
  checked: boolean;
  nest?: string[];
  checkedAt: string | null;
};

class Store {
  @observable tasks: Task[] = [];

  @action.bound
  setTasks(tasks: Task[]) {
    this.tasks = tasks;
  }
}
export const store = new Store();
