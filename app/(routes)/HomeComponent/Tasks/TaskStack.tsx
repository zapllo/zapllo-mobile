import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MyTaskScreen from "./MyTaskScreen";
import PendingTaskScreen from "~/screens/Task/DelegatedPendingTask";

export type TaskStackParamList = {
    DelegatedTask: undefined;
    PendingTask: { pendingTasks: Task[] };
};

const Stack = createStackNavigator<TaskStackParamList>();

const TaskStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DelegatedTask" component={MyTaskScreen} />
      <Stack.Screen name="PendingTask" component={PendingTaskScreen} />
      

    </Stack.Navigator>
  );
};

export default TaskStack;
