"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { authApi } from "./api/authApi";
import { logout, rehydrate } from "./authSlice";
import { store, useAppDispatch } from "./store";

// Initializer to check for cookies on reload
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      // Check if the edge cookie survived the reload
      const jwt = Cookies.get("jwt");
      if (!jwt) {
        setIsInitialized(true);
        return;
      }

      try {
        const data = await dispatch(
          authApi.endpoints.getMe.initiate(jwt),
        ).unwrap();
        dispatch(rehydrate(data));
      } catch (error: any) {
        if (typeof error?.status === "number") {
          Cookies.remove("jwt");
          Cookies.remove("role");
          dispatch(logout());
        }
        console.error("Failed to restore session on reload:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    restoreSession();
  }, [dispatch]);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}

// Wrap the app with both the Provider and the Initializer
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
