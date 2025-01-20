import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DelegatedTaskScreen from './DelegatedTaskScreen ';
import PendingTaskScreen from '~/screens/Task/delegatedTask/DelegatedPendingTask';
import DelegatedTodaysTaskScreen from '~/screens/Task/delegatedTask/DelegatedTodaysTaskScreen';
import DelegatedOverdueTaskScreen from '~/screens/Task/delegatedTask/DelegatedOverdueTaskScreen';
import DelegatedCompletedTask from '~/screens/Task/delegatedTask/DelegatedCompletedTask';
import DelegatedInTimeTask from '~/screens/Task/delegatedTask/DelegatedInTimeTask';
import DelegatedDelayedTaskScreen from '~/screens/Task/delegatedTask/DelegatedDelayedTaskScreen';
import DelegatedInprogressTask from '~/screens/Task/delegatedTask/DelegatedInprogressTask';

type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
interface Task {
  _id: string; // Assuming tasks have an ID
  status: TaskStatus;
  assignedUser: {
    firstName?: string;
    lastName?: string;
  };
  // Add other properties of a task as needed
}

export type DelegatedTaskStackParamList = {
  DelegatedTask: undefined;
  PendingTask: { pendingTasks: Task[] };
  ToadysTask: { todaysTasks: Task[] };
  OverdueTask: { overdueTasks: Task[] };
  CompletedTask: { completedTasks: Task[] };
  InTimeTask: { inTimeTasks: Task[] };
  DelayedTask: { delayedTasks: Task[] };
  InprogressTask: { inProgressTasks: Task[] };
};

const Stack = createStackNavigator<DelegatedTaskStackParamList>();

const DelegatedTaskStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DelegatedTask" component={DelegatedTaskScreen} />
      <Stack.Screen name="PendingTask" component={PendingTaskScreen} />
      <Stack.Screen name="ToadysTask" component={DelegatedTodaysTaskScreen} />
      <Stack.Screen name="OverdueTask" component={DelegatedOverdueTaskScreen} />
      <Stack.Screen name="CompletedTask" component={DelegatedCompletedTask} />
      <Stack.Screen name="InTimeTask" component={DelegatedInTimeTask} />
      <Stack.Screen name="DelayedTask" component={DelegatedDelayedTaskScreen} />
      <Stack.Screen name="InprogressTask" component={DelegatedInprogressTask} />
    </Stack.Navigator>
  );
};

export default DelegatedTaskStack;
