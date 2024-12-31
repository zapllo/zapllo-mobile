import React from "react";
import { Route } from "../../routes";
import { useSelector } from "react-redux";

import AuthenticationStack from "./stack/AuthenticationStack";
import HomeStack from "./stack/HomeStack";

const RootStack = () => {
  const navigation = useSelector((state) => state?.screen?.screen);
  console.log("navigation", navigation);

  switch (navigation) {
    case Route.MAIN:
      return <AuthenticationStack />;
    case Route.HOME_STACK:
      return <HomeStack />;

    default:
      return <AuthenticationStack />;
  }
};

export default RootStack;
