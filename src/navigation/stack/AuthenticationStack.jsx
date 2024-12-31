import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../../screens/LoginScreen";
import { Route } from "../../../routes";
import SignupScreen from "../../screens/SignupScreen";

const Stack = createStackNavigator();

const AuthenticationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Route.LOGIN} component={LoginScreen} />
      <Stack.Screen name={Route.SIGNUP} component={SignupScreen} />

    </Stack.Navigator>
  );
};

export default AuthenticationStack;
