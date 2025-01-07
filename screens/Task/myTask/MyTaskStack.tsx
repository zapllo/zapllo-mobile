import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MyTaskScreen from "~/app/(routes)/HomeComponent/Tasks/MyTaskScreen";
import MyTaskPendingScreen from "./MyTaskPendingScreen";
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

export type MyTasksStackParamList = {
  DashboardHome: undefined;
  PendingTask: { pendingTasks: Task[] };
  // EmployeeWise: undefined;
};

const Stack = createStackNavigator<MyTasksStackParamList>();

const MyTasksStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={MyTaskScreen} />
      <Stack.Screen name="PendingTask" component={MyTaskPendingScreen} />
      {/* <Stack.Screen name="EmployeeWise" component={EmployeeWiseScreen}/> */}

    </Stack.Navigator>
  );
};

export default MyTasksStack;
