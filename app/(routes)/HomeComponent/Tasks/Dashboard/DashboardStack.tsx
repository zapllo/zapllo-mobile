import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "./DashboardScreen";
import EmployeeWiseScreen from "~/screens/Task/EmployeeWise.screen";
// Define the TaskStatus type
type TaskStatus = 'Pending' | 'InProgress' | 'Completed'; // Add other statuses as needed

// Define the Task interface
interface Task {
  _id: string; // Assuming tasks have an ID
  status: TaskStatus;
  assignedUser: {
    firstName?: string;
    lastName?: string;
  };
  // Add other properties of a task as needed
}

// Ensure this is imported where needed


export type DashboardStackParamList = {
  DashboardHome: undefined;
  EmployeeWise: undefined;
};

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      {/* <Stack.Screen name="PendingTask" component={PendingTaskScreen} /> */}
      <Stack.Screen name="EmployeeWise" component={EmployeeWiseScreen}/>

    </Stack.Navigator>
  );
};

export default DashboardStack;
