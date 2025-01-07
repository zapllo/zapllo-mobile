// src/app/navigation/navigation.ts
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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

type PendingTaskRouteProp =
  | RouteProp<DashboardStackParamList, 'PendingTask'>
  | RouteProp<TaskStackParamList, 'PendingTask'>;

type PendingTaskNavigationProp =
  | StackNavigationProp<DashboardStackParamList, 'PendingTask'>
  | StackNavigationProp<TaskStackParamList, 'PendingTask'>;

export type PendingTaskScreenProps = {
  route: PendingTaskRouteProp;
  navigation: PendingTaskNavigationProp;
};
