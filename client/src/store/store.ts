import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import songReducer from "./slices/songSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    song: songReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
