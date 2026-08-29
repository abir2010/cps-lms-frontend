import { api } from "../api";
import type { User } from "../authSlice";

export interface AuthResult {
  jwt: string;
  user: User;
}

interface StrapiMe {
  id: number;
  documentId: string;
  username: string;
  email: string;
  role?: { name: string } | null;
}

function toAuthResult(jwt: string, me: StrapiMe): AuthResult {
  return {
    jwt,
    user: {
      id: me.id,
      username: me.username,
      documentId: me.documentId,
      email: me.email,
      role: me.role?.name || "Student",
    },
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      AuthResult,
      { identifier: string; password: string }
    >({
      queryFn: async ({ identifier, password }, _api, _extra, baseQuery) => {
        const authResult = await baseQuery({
          url: "/auth/local",
          method: "POST",
          body: { identifier, password },
        });
        if (authResult.error) return { error: authResult.error };
        const { jwt } = authResult.data as { jwt: string };

        const meResult = await baseQuery({
          url: "/users/me?populate=role",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (meResult.error) return { error: meResult.error };

        return { data: toAuthResult(jwt, meResult.data as StrapiMe) };
      },
    }),

    register: builder.mutation<
      AuthResult,
      { username: string; email: string; password: string }
    >({
      queryFn: async (
        { username, email, password },
        _api,
        _extra,
        baseQuery,
      ) => {
        const registerResult = await baseQuery({
          url: "/auth/local/register",
          method: "POST",
          body: { username, email, password },
        });
        if (registerResult.error) return { error: registerResult.error };
        const { jwt } = registerResult.data as { jwt: string };

        const meResult = await baseQuery({
          url: "/users/me?populate=role",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (meResult.error) return { error: meResult.error };

        return { data: toAuthResult(jwt, meResult.data as StrapiMe) };
      },
    }),

    getMe: builder.mutation<AuthResult, string>({
      queryFn: async (jwt, _api, _extra, baseQuery) => {
        const meResult = await baseQuery({
          url: "/users/me?populate=role",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (meResult.error) return { error: meResult.error };

        return { data: toAuthResult(jwt, meResult.data as StrapiMe) };
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
