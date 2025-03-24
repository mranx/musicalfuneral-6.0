import { configureStore } from "@reduxjs/toolkit";
import selections from "./reducers/selections";
import formsData from "./reducers/formsData";

// Create the store with the reducers
const store = configureStore({
  reducer: {
    selections: selections,
    formsData: formsData,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
