import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Dashboard from "../../screens/Dashboard";
import { Route } from "../../../routes";

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={Route.DASHBOARD}
    >
      <Stack.Screen name={Route.DASHBOARD} component={Dashboard} />
    </Stack.Navigator>
  );
};

export default HomeStack;
