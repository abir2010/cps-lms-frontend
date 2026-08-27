import { api } from "../api";

export interface BlogAuthor {
  id: number;
  documentId: string;
  username: string;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  body: string;
  cover_image_url: string | null;
  status_type: "draft" | "published";
  createdAt: string;
  author?: BlogAuthor;
}

interface BlogInput {
  title: string;
  body: string;
  cover_image_url?: string | null;
  status_type: "draft" | "published";
}

export const blogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Public list — the backend already hides drafts from non-privileged
    // callers, but we filter explicitly too so the *public* page reads as
    // "published only" even for an Admin/Content Manager who's browsing it
    // logged in.
    getPublishedBlogs: builder.query<BlogPost[], void>({
      query: () =>
        `/blogs?filters[status_type][$eq]=published&populate=author&sort=createdAt:desc`,
      transformResponse: (res: { data: BlogPost[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Blog" as const, id })),
              { type: "Blog" as const, id: "LIST" },
            ]
          : [{ type: "Blog" as const, id: "LIST" }],
    }),

    getBlogPost: builder.query<BlogPost, string>({
      query: (documentId) => `/blogs/${documentId}?populate=author`,
      transformResponse: (res: { data: BlogPost }) => res.data,
      providesTags: (_result, _error, documentId) => [
        { type: "Blog", id: documentId },
      ],
    }),

    // Admin / Content Manager management view — every post, drafts included.
    getAllBlogs: builder.query<BlogPost[], void>({
      query: () => `/blogs?populate=author&sort=createdAt:desc`,
      transformResponse: (res: { data: BlogPost[] }) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Blog" as const, id })),
              { type: "Blog" as const, id: "LIST" },
            ]
          : [{ type: "Blog" as const, id: "LIST" }],
    }),

    createBlog: builder.mutation<BlogPost, BlogInput>({
      query: (data) => ({
        url: "/blogs",
        method: "POST",
        // publishedAt is Strapi's own draft/publish flag; this app tracks
        // visibility with its own `status_type` field instead (so an author
        // can save either state without fighting Strapi's native system),
        // so every create force-publishes the underlying Strapi entry.
        body: { data: { ...data, publishedAt: new Date().toISOString() } },
      }),
      transformResponse: (res: { data: BlogPost }) => res.data,
      invalidatesTags: [{ type: "Blog", id: "LIST" }],
    }),

    updateBlog: builder.mutation<
      BlogPost,
      { documentId: string; data: BlogInput }
    >({
      query: ({ documentId, data }) => ({
        url: `/blogs/${documentId}`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: "Blog", id: documentId },
        { type: "Blog", id: "LIST" },
      ],
    }),

    deleteBlog: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/blogs/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPublishedBlogsQuery,
  useGetBlogPostQuery,
  useGetAllBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
