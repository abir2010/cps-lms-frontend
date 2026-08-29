"use client";

import { BlogForm, type BlogFormValues } from "@/components/blog/BlogForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetBlogPostQuery,
  useUpdateBlogMutation,
} from "@/src/store/api/blogApi";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditContentBlogPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  const {
    data: post,
    isLoading,
    error,
  } = useGetBlogPostQuery(params.documentId);
  const [updateBlog, { isLoading: isSaving }] = useUpdateBlogMutation();

  const onSubmit = async (values: BlogFormValues) => {
    await updateBlog({
      documentId: params.documentId,
      data: { ...values, cover_image_url: values.cover_image_url || null },
    }).unwrap();
    router.push("/content/blogs");
  };

  if (isLoading) {
    return <p className="p-8 text-muted-foreground">Loading post...</p>;
  }

  if (error || !post) {
    return (
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <p>Post not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground mt-1">
            Update this article or announcement.
          </p>
        </div>
      </div>

      <BlogForm
        submitLabel="Save Changes"
        isSubmitting={isSaving}
        initialValues={{
          title: post.title,
          body: post.body,
          cover_image_url: post.cover_image_url ?? "",
          status_type: post.status_type,
        }}
        onSubmit={onSubmit}
        onCancel={() => router.push("/content/blogs")}
      />
    </div>
  );
}
