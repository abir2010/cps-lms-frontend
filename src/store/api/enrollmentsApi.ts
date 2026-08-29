import { api } from "../api";
import type { Course } from "./coursesApi";

export interface EnrollmentStudent {
  id: number;
  documentId: string;
  username: string;
  email?: string;
}

export interface Enrollment {
  id: number;
  documentId: string;
  progress_percentage: number;
  course?: Course;
  student?: EnrollmentStudent;
  completed_lessons?: { id: number; documentId: string }[];
}

export const enrollmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyEnrollments: builder.query<Enrollment[], void>({
      query: () =>
        `/enrollments?populate[course][populate][instructor]=true&populate[course][populate][lessons]=true&populate[completed_lessons]=true`,
      transformResponse: (res: { data: Enrollment[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ documentId }) => ({
                type: "Enrollment" as const,
                id: documentId,
              })),
              { type: "Enrollment" as const, id: "LIST" },
            ]
          : [{ type: "Enrollment" as const, id: "LIST" }],
    }),

    getEnrollmentForCourse: builder.query<Enrollment | null, string>({
      query: (courseDocumentId) =>
        `/enrollments?filters[course][documentId][$eq]=${courseDocumentId}&populate=completed_lessons`,
      transformResponse: (res: { data: Enrollment[] }) => res.data[0] ?? null,
      providesTags: (result) =>
        result
          ? [
              { type: "Enrollment", id: result.documentId },
              { type: "Enrollment", id: "LIST" },
            ]
          : [{ type: "Enrollment", id: "LIST" }],
    }),

    getCourseEnrollments: builder.query<Enrollment[], string>({
      query: (courseDocumentId) =>
        `/enrollments?filters[course][documentId][$eq]=${courseDocumentId}&populate=student`,
      transformResponse: (res: { data: Enrollment[] }) => res.data,
      providesTags: (_result, _error, courseDocumentId) => [
        { type: "Enrollment", id: `COURSE-${courseDocumentId}` },
        { type: "Enrollment", id: "LIST" },
      ],
    }),

    enroll: builder.mutation<Enrollment, string>({
      query: (courseDocumentId) => ({
        url: "/enrollments",
        method: "POST",
        body: { data: { progress_percentage: 0, course: courseDocumentId } },
      }),
      transformResponse: (res: { data: Enrollment }) => res.data,
      invalidatesTags: [{ type: "Enrollment", id: "LIST" }],
    }),

    updateEnrollmentProgress: builder.mutation<
      Enrollment,
      {
        documentId: string;
        progress_percentage: number;
        completedLessonDocumentId?: string;
      }
    >({
      query: ({
        documentId,
        progress_percentage,
        completedLessonDocumentId,
      }) => ({
        url: `/enrollments/${documentId}`,
        method: "PUT",
        body: {
          data: {
            progress_percentage,
            ...(completedLessonDocumentId
              ? { completed_lessons: { connect: [completedLessonDocumentId] } }
              : {}),
          },
        },
      }),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: "Enrollment", id: documentId },
        { type: "Enrollment", id: "LIST" },
      ],
    }),

    getMyCoursesEnrollments: builder.query<Enrollment[], void>({
      query: () => `/enrollments?populate=student,course`,
      transformResponse: (res: { data: Enrollment[] }) => res.data,
      providesTags: [{ type: "Enrollment", id: "LIST" }],
    }),

    getEnrollmentCount: builder.query<number, void>({
      query: () =>
        `/enrollments?pagination[pageSize]=1&pagination[withCount]=true`,
      transformResponse: (res: { meta: { pagination: { total: number } } }) =>
        res.meta.pagination.total,
      providesTags: [{ type: "Enrollment", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyEnrollmentsQuery,
  useGetEnrollmentForCourseQuery,
  useGetCourseEnrollmentsQuery,
  useGetMyCoursesEnrollmentsQuery,
  useEnrollMutation,
  useUpdateEnrollmentProgressMutation,
  useGetEnrollmentCountQuery,
} = enrollmentsApi;
