import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from "redux-persist";
import {screenSlice} from "./slice/ScreenNavigationSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";


const rootReducer = combineReducers({
  screen: screenSlice,

});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  blacklist: ["index","screen"],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
