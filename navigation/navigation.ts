// navigation.ts
export type PendingTaskParam = { pendingTasks: Task[] };

export type DashboardStackParamList = {
  DashboardHome: undefined;
  PendingTask: PendingTaskParam;
};

export type TaskStackParamList = {
  TaskHome: undefined;
  PendingTask: PendingTaskParam;
  CompletedTask: { completedTasks: Task[] };
};

export type AppTabParamList = {
  Dashboard: undefined;
  MyTask: undefined;
  DelegatedTask: undefined;
  AllTask: undefined;
};
