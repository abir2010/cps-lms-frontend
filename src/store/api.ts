import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${STRAPI_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const jwt = (getState() as RootState).auth.jwt;
      if (jwt) headers.set("Authorization", `Bearer ${jwt}`);
      return headers;
    },
  }),
  tagTypes: [
    "Course",
    "Lesson",
    "Enrollment",
    "Blog",
    "User",
    "Quiz",
    "QuizResult",
  ],
  endpoints: () => ({}),
});
