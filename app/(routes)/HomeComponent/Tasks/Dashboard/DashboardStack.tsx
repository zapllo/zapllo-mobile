import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "./DashboardScreen";
import PendingTaskScreen from "~/screens/Task/pendingTask.screen";
import EmployeeWiseScreen from "~/screens/Task/EmployeeWise.screen";

export type DashboardStackParamList = {
  DashboardHome: undefined;
  PendingTask: { pendingTasks: Task[] };
  // EmployeeWise:undefined;
};

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="PendingTask" component={PendingTaskScreen} />
      {/* <Stack.Screen name="EmployeeWise" component={EmployeeWiseScreen}/> */}

    </Stack.Navigator>
  );
};

export default DashboardStack;
