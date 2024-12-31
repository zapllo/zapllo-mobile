import "react-native-gesture-handler"; // Ensure gesture handler import is correct
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/navigation/RootStack";
import { store } from "./src/redux/store";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>

          <StatusBar style="auto" />
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
