import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  jwt: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  jwt: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; jwt: string }>,
    ) => {
      state.user = action.payload.user;
      state.jwt = action.payload.jwt;
      state.isAuthenticated = true;
    },
    rehydrate: (state, action: PayloadAction<{ user: User; jwt: string }>) => {
      state.user = action.payload.user;
      state.jwt = action.payload.jwt;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.jwt = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, rehydrate, logout } = authSlice.actions;
export default authSlice.reducer;
