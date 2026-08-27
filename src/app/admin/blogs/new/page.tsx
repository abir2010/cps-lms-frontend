"use client";

import { BlogForm, type BlogFormValues } from "@/components/blog/BlogForm";
import { Button } from "@/components/ui/button";
import { useCreateBlogMutation } from "@/src/store/api/blogApi";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateAdminBlogPost() {
  const router = useRouter();
  const [createBlog, { isLoading }] = useCreateBlogMutation();

  const onSubmit = async (values: BlogFormValues) => {
    await createBlog({
      ...values,
      cover_image_url: values.cover_image_url || null,
    }).unwrap();
    router.push("/admin/blogs");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draft New Post</h1>
          <p className="text-slate-500 mt-1">
            Write a new article or announcement for the platform.
          </p>
        </div>
      </div>

      <BlogForm
        submitLabel="Save Post"
        isSubmitting={isLoading}
        onSubmit={onSubmit}
        onCancel={() => router.push("/admin/blogs")}
      />
    </div>
  );
}
