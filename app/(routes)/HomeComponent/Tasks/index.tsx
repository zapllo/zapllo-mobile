import { StyleSheet} from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TasksScreen from "~/screens/Task/tasks.screen";


const Tab = createBottomTabNavigator();
export default function Tasks() {
  return (
    <TasksScreen/>
    
  );
}

const styles = StyleSheet.create({});
