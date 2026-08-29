import { api } from "../api";

export type QuizOption = "A" | "B" | "C" | "D";

export interface QuizQuestion {
  id: number;
  documentId: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: QuizOption;
  course?: { id: number; documentId: string; title: string };
}

export interface QuizResult {
  id: number;
  documentId: string;
  score: number;
  selected_answer: QuizOption;
  quiz?: QuizQuestion;
  student?: { id: number; username: string };
}

interface QuizQuestionInput {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: QuizOption;
  course: number;
  courseDocumentId: string;
}

export const quizApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQuizForCourse: builder.query<QuizQuestion[], string>({
      query: (courseDocumentId) =>
        `/quizzes?filters[course][documentId][$eq]=${courseDocumentId}`,
      transformResponse: (res: { data: QuizQuestion[] }) => res.data,
      providesTags: (result, _error, courseDocumentId) =>
        result
          ? [
              ...result.map(({ documentId }) => ({
                type: "Quiz" as const,
                id: documentId,
              })),
              { type: "Quiz" as const, id: `COURSE-${courseDocumentId}` },
            ]
          : [{ type: "Quiz" as const, id: `COURSE-${courseDocumentId}` }],
    }),

    addQuizQuestion: builder.mutation<QuizQuestion, QuizQuestionInput>({
      query: (input) => {
        const { courseDocumentId, ...data } = input;
        void courseDocumentId;
        return { url: "/quizzes", method: "POST", body: { data } };
      },
      transformResponse: (res: { data: QuizQuestion }) => res.data,
      invalidatesTags: (_result, _error, { courseDocumentId }) => [
        { type: "Quiz", id: `COURSE-${courseDocumentId}` },
      ],
    }),

    updateQuizQuestion: builder.mutation<
      QuizQuestion,
      {
        documentId: string;
        courseDocumentId: string;
        data: Partial<QuizQuestionInput>;
      }
    >({
      query: ({ documentId, data }) => ({
        url: `/quizzes/${documentId}`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_result, _error, { documentId, courseDocumentId }) => [
        { type: "Quiz", id: documentId },
        { type: "Quiz", id: `COURSE-${courseDocumentId}` },
      ],
    }),

    deleteQuizQuestion: builder.mutation<
      void,
      { documentId: string; courseDocumentId: string }
    >({
      query: ({ documentId }) => ({
        url: `/quizzes/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { courseDocumentId }) => [
        { type: "Quiz", id: `COURSE-${courseDocumentId}` },
      ],
    }),

    getMyQuizResults: builder.query<QuizResult[], string>({
      query: (courseDocumentId) =>
        `/quiz-results?filters[quiz][course][documentId][$eq]=${courseDocumentId}&populate=quiz`,
      transformResponse: (res: { data: QuizResult[] }) => res.data,
      providesTags: (_result, _error, courseDocumentId) => [
        { type: "QuizResult", id: `COURSE-${courseDocumentId}` },
      ],
    }),

    getCourseQuizResults: builder.query<QuizResult[], string>({
      query: (courseDocumentId) =>
        `/quiz-results?filters[quiz][course][documentId][$eq]=${courseDocumentId}&populate=student,quiz`,
      transformResponse: (res: { data: QuizResult[] }) => res.data,
      providesTags: (_result, _error, courseDocumentId) => [
        { type: "QuizResult", id: `COURSE-${courseDocumentId}` },
      ],
    }),

    getInstructorQuizResults: builder.query<QuizResult[], void>({
      query: () =>
        `/quiz-results?populate[student]=true&populate[quiz][populate][course]=true`,
      transformResponse: (res: { data: QuizResult[] }) => res.data,
      providesTags: [{ type: "QuizResult", id: "LIST" }],
    }),

    submitQuizAnswer: builder.mutation<
      QuizResult,
      { quiz: number; selected_answer: QuizOption; courseDocumentId: string }
    >({
      query: (input) => {
        const { courseDocumentId, ...data } = input;
        void courseDocumentId;
        return { url: "/quiz-results", method: "POST", body: { data } };
      },
      transformResponse: (res: { data: QuizResult }) => res.data,
      invalidatesTags: (_result, _error, { courseDocumentId }) => [
        { type: "QuizResult", id: `COURSE-${courseDocumentId}` },
      ],
    }),
  }),
});

export const {
  useGetQuizForCourseQuery,
  useAddQuizQuestionMutation,
  useUpdateQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useGetMyQuizResultsQuery,
  useGetCourseQuizResultsQuery,
  useGetInstructorQuizResultsQuery,
  useSubmitQuizAnswerMutation,
} = quizApi;
