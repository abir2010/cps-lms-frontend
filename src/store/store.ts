import {
  combineReducers,
  configureStore,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { api } from "./api";
import authReducer from "./authSlice";

const appReducer = combineReducers({
  auth: authReducer,
  [api.reducerPath]: api.reducer,
});

type AppState = ReturnType<typeof appReducer>;

const SESSION_BOUNDARY_ACTIONS = new Set([
  "auth/setCredentials",
  "auth/logout",
]);

const rootReducer = (state: AppState | undefined, action: UnknownAction) => {
  if (SESSION_BOUNDARY_ACTIONS.has(action.type)) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
