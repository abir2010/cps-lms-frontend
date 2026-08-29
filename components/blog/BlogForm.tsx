"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/shared/field-error";
import { Loader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  body: z.string().min(20, "Blog content must be at least 20 characters."),
  cover_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  status_type: z.enum(["draft", "published"]),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  initialValues?: BlogFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: BlogFormValues) => Promise<void> | void;
  onCancel: () => void;
}

export function BlogForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: BlogFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialValues ?? { status_type: "draft" },
  });

  const submit = async (values: BlogFormValues) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      setError("root", {
        message: err?.data?.error?.message ?? "Something went wrong.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Post Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. 5 Tips for Mastering React"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL (Optional)</Label>
            <Input
              id="cover_image_url"
              placeholder="https://example.com/image.jpg"
              {...register("cover_image_url")}
            />
            <FieldError message={errors.cover_image_url?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">
              Post Body <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="body"
              placeholder="Write your blog post content here..."
              className="min-h-75"
              {...register("body")}
            />
            <FieldError message={errors.body?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_type">
              Visibility Status <span className="text-destructive">*</span>
            </Label>
            <select
              id="status_type"
              className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              {...register("status_type")}
            >
              <option value="draft">Draft (Hidden from students)</option>
              <option value="published">Published (Visible to everyone)</option>
            </select>
            <FieldError message={errors.status_type?.message} />
          </div>

          <FieldError message={errors.root?.message} />

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader size="sm" label="Saving..." />
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
