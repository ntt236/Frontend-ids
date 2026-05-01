import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import alertReducer from "./slices/alertSlice";
import wsReducer from "./slices/wsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import { injectStore } from "@/services/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alerts: alertReducer,
    ws: wsReducer,
    dashboard: dashboardReducer,
  },
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
