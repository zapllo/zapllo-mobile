import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DelegatedTaskScreen from "./DelegatedTaskScreen ";
import PendingTaskScreen from "~/screens/Task/DelegatedPendingTask";
import DelegatedTodaysTaskScreen from "~/screens/Task/DelegatedTodaysTaskScreen";
import DelegatedOverdueTaskScreen from "~/screens/Task/myTask/DelegatedOverdueTaskScreen";
import DelegatedCompletedTask from "~/screens/Task/myTask/DelegatedCompletedTask";
import DelegatedInTimeTask from "~/screens/Task/myTask/DelegatedInTimeTask";
import DelegatedDelayedTaskScreen from "~/screens/Task/myTask/DelegatedDelayedTaskScreen";

export type DelegatedTaskStackParamList = {
    DelegatedTask: undefined;
    PendingTask: { pendingTasks: Task[] };
    ToadysTask: { todaysTasks: Task[] };
    OverdueTask: { overdueTasks: Task[] };
    CompletedTask: { completedTasks: Task[] };
    InTimeTask: { inTimeTasks: Task[] };
    DelayedTask: { delayedTasks: Task[] };
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
    </Stack.Navigator>
  );
};

export default DelegatedTaskStack;
