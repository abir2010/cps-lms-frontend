import { api } from "../api";

export interface Role {
  id: number;
  name: string;
  type: string;
}

export interface PlatformUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  role: Role | null;
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PlatformUser[], void>({
      query: () => `/users?populate=role`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getRoles: builder.query<Role[], void>({
      query: () => `/users-permissions/roles`,
      transformResponse: (res: { roles: Role[] }) => res.roles,
    }),

    updateUserRole: builder.mutation<
      PlatformUser,
      { userId: number; roleId: string }
    >({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: { role: roleId },
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const { useGetUsersQuery, useGetRolesQuery, useUpdateUserRoleMutation } =
  usersApi;
