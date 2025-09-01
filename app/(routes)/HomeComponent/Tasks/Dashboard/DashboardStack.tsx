import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "./DashboardScreen";
import EmployeeWiseScreen from "~/screens/Task/EmployeeWise.screen";
import MyReportScreen from "~/screens/Task/MyReportScreen";
import CategoryWiseScreen from "~/screens/Task/CategoryWiseScreen";
import CategoryTasksScreen from "~/screens/Task/CategoryTasksScreen";
import DelegatedScreen from "~/screens/Task/delegatedTask/DelegatedScreen";

// Define the TaskStatus type
type TaskStatus = 'Pending' | 'InProgress' | 'Completed'; // Add other statuses as needed

// Define the Task interface
interface Task {
  filter: any;
  _id: string; // Task ID
  status: TaskStatus; // Status of the task (Completed, Pending, etc.)
  assignedUser: {
    _id: string; // User ID
    firstName: string; // First name of the assigned user
    lastName: string; // Last name of the assigned user
  };
  attachment: any[]; // Array of attachments (can be any type, adjust if needed)
  audioUrl: string | null; // URL for audio, can be null
  category: {
    _id: string; // Category ID
    name: string; // Category name (e.g., 'Marketing')
  };
  comments: Array<{
    // Define structure for comments if necessary
    _id: string;
    text: string;
    createdAt: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  completionDate: string; // Date when the task was completed
  createdAt: string; // Task creation date
  dates: string[]; // Array of date strings (adjust based on your data)
  days: string[]; // Array of days (adjust based on your data)
  description: string; // Task description
  dueDate: string; // Task due date
  links: string[]; // Links related to the task
  organization: string; // Organization ID
  priority: "Low" | "Medium" | "High"; // Task priority
  reminders: any[]; // Array for reminders (define type if needed)
  repeat: boolean; // Whether the task repeats or not
  title: string; // Task title
  updatedAt: string; // Last update timestamp
  user: {
    _id: string; // User ID of the person associated with the task
    firstName: string; // First name of the user
    lastName: string; // Last name of the user
  };
  __v: number; // Version key, usually used for document versioning in MongoDB
}



export type DashboardStackParamList = {
  DashboardHome: undefined;
  EmployeeWise: { employeeWiseData: Task[] };
  MyReports: { employeeWiseData: Task[] };
  CategoryWise: { employeeWiseData: Task[] };
  CategoryTasks: { categoryData: any; categoryName: string };
  Delegated: { employeeWiseData: Task[] };
};

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      {/* <Stack.Screen name="PendingTask" component={PendingTaskScreen} /> */}
      <Stack.Screen name="EmployeeWise" component={EmployeeWiseScreen}/>
      <Stack.Screen name="MyReports" component={MyReportScreen}/>
      <Stack.Screen name="CategoryWise" component={CategoryWiseScreen}/>
      <Stack.Screen name="CategoryTasks" component={CategoryTasksScreen}/>
      <Stack.Screen name="Delegated" component={DelegatedScreen}/>
    </Stack.Navigator>
  );
};

export default DashboardStack;
