"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { setCredentials } from "./authSlice";
import { store, useAppDispatch } from "./store";

// Create a silent initializer to check for cookies on reload
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      // Check if the edge cookie survived the reload
      const jwt = Cookies.get("jwt");
      if (!jwt) return;

      try {
        const STRAPI_URL =
          process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

        // Fetch the user profile using the saved JWT
        const res = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (res.ok) {
          const userData = await res.json();

          // Rehydrate the Redux store!
          dispatch(
            setCredentials({
              jwt,
              user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role?.name || "Student",
              },
            }),
          );
        }
      } catch (error) {
        console.error("Failed to restore session on reload:", error);
      }
    };

    restoreSession();
  }, [dispatch]);

  return <>{children}</>;
}

// 2. Wrap the app with both the Provider and the Initializer
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
