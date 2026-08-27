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
    // The backend already scopes results to "my own" for a Student and "my
    // courses' students" for an Instructor — this endpoint just needs to ask.
    getMyEnrollments: builder.query<Enrollment[], void>({
      query: () =>
        `/enrollments?populate[course][populate][instructor]=true&populate[course][populate][lessons]=true&populate[completed_lessons]=true`,
      transformResponse: (res: { data: Enrollment[] }) => res.data,
      // Tagged by documentId (not the numeric `id`) because every mutation
      // below invalidates by documentId — a mismatched key type here would
      // mean "invalidate" silently invalidates nothing and the UI goes stale.
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

    // One enrollment's full detail (with lessons on the course) for the
    // lesson-viewer page.
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

    // Instructor/Admin/Content Manager view of who's enrolled in one course
    // and how far along they are — the backend enforces "own courses only"
    // for Instructor, so the same query is safe to reuse everywhere.
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

    // Lightweight count for the admin stats dashboard.
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
  useEnrollMutation,
  useUpdateEnrollmentProgressMutation,
  useGetEnrollmentCountQuery,
} = enrollmentsApi;
