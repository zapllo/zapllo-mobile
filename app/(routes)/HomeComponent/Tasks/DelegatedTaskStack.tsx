import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DelegatedTaskScreen from "./DelegatedTaskScreen ";
import PendingTaskScreen from "~/screens/Task/DelegatedPendingTask";

export type DelegatedTaskStackParamList = {
    DelegatedTask: undefined;
    PendingTask: { pendingTasks: Task[] };
};

const Stack = createStackNavigator<DelegatedTaskStackParamList>();

const DelegatedTaskStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DelegatedTask" component={DelegatedTaskScreen} />
      <Stack.Screen name="PendingTask" component={PendingTaskScreen} />
    </Stack.Navigator>
  );
};

export default DelegatedTaskStack;
