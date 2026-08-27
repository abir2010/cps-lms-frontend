import { api } from "../api";

export interface CourseInstructor {
  id: number;
  documentId: string;
  username: string;
  email?: string;
}

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  type: "text" | "video";
  text_content: string | null;
  video_url: string | null;
  sequence_order: number | null;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  publishedAt: string | null;
  instructor?: CourseInstructor;
  lessons?: Lesson[];
}

interface NewLessonInput {
  title: string;
  type: "text" | "video";
  text_content?: string;
  video_url?: string;
  sequence_order: number;
  course: number;
  /** Not sent to the API — only used to invalidate the right cached course. */
  courseDocumentId: string;
}

export const coursesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // `instructorId` powers the "own courses only" (Instructor) vs "every
    // course on the platform" (Admin / Content Manager) views with one
    // endpoint instead of two near-identical ones.
    getCourses: builder.query<Course[], { instructorId?: number } | void>({
      query: (args) => {
        const filter = args?.instructorId
          ? `&filters[instructor][id][$eq]=${args.instructorId}`
          : "";
        return `/courses?populate=instructor${filter}`;
      },
      transformResponse: (res: { data: Course[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Course" as const, id })),
              { type: "Course" as const, id: "LIST" },
            ]
          : [{ type: "Course" as const, id: "LIST" }],
    }),

    getCourse: builder.query<Course, string>({
      query: (documentId) =>
        `/courses/${documentId}?populate[lessons][sort]=sequence_order:asc&populate[instructor]=true`,
      transformResponse: (res: { data: Course }) => res.data,
      providesTags: (_result, _error, documentId) => [
        { type: "Course", id: documentId },
      ],
    }),

    createCourse: builder.mutation<
      Course,
      { title: string; description: string; instructor?: number }
    >({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: { data },
      }),
      transformResponse: (res: { data: Course }) => res.data,
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    updateCourse: builder.mutation<
      Course,
      {
        documentId: string;
        data: Partial<Pick<Course, "title" | "description">>;
      }
    >({
      query: ({ documentId, data }) => ({
        url: `/courses/${documentId}`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: "Course", id: documentId },
        { type: "Course", id: "LIST" },
      ],
    }),

    deleteCourse: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/courses/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    // Lightweight count for the admin stats dashboard — avoids pulling every
    // course record just to show a number.
    getCourseCount: builder.query<number, void>({
      query: () => `/courses?pagination[pageSize]=1&pagination[withCount]=true`,
      transformResponse: (res: { meta: { pagination: { total: number } } }) =>
        res.meta.pagination.total,
      providesTags: [{ type: "Course", id: "LIST" }],
    }),

    addLesson: builder.mutation<Lesson, NewLessonInput>({
      query: (input) => {
        // courseDocumentId only exists to key cache invalidation below — the
        // API itself only wants the fields Strapi's lesson model knows about.
        const { courseDocumentId, ...data } = input;
        void courseDocumentId;
        return { url: "/lessons", method: "POST", body: { data } };
      },
      transformResponse: (res: { data: Lesson }) => res.data,
      invalidatesTags: (_result, _error, { courseDocumentId }) => [
        { type: "Course", id: courseDocumentId },
      ],
    }),

    updateLesson: builder.mutation<
      Lesson,
      { documentId: string; courseDocumentId: string; data: Partial<Lesson> }
    >({
      query: ({ documentId, data }) => ({
        url: `/lessons/${documentId}`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_result, _error, { courseDocumentId }) => [
        { type: "Course", id: courseDocumentId },
      ],
    }),

    deleteLesson: builder.mutation<
      void,
      { documentId: string; courseDocumentId: string }
    >({
      query: ({ documentId }) => ({
        url: `/lessons/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { courseDocumentId }) => [
        { type: "Course", id: courseDocumentId },
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAddLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetCourseCountQuery,
} = coursesApi;
