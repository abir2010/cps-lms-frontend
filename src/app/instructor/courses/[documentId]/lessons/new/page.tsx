"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppSelector } from "../../../../../../store/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// Require title, and AT LEAST one of content or video_url
const lessonSchema = z
  .object({
    title: z.string().min(3, "Lesson title must be at least 3 characters."),
    video_url: z.string().optional(),
    text_content: z.string().optional(),
  })
  .refine((data) => data.text_content || data.video_url, {
    message: "You must provide either a video link, text content, or both.",
    path: ["root"], // Attaches the error to the root of the form
  });

type LessonSchema = z.infer<typeof lessonSchema>;

export default function CreateLessonPage() {
  const params = useParams();
  const documentId = params.documentId as string; // The parent course ID
  const router = useRouter();
  const { jwt } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const onSubmit = async (values: LessonSchema) => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title: values.title,
            video_url: values.video_url,
            text_content: values.text_content,
            course: documentId,
            type: values.video_url ? "video" : "text",
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to create lesson");
      }

      // Redirect back to the course edit page
      router.push(`/instructor/courses/${documentId}/edit`);
    } catch (error: any) {
      console.error(error);
      setError("root", { message: error.message || "Something went wrong." });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Lesson</h1>
          <p className="text-slate-500 mt-1">
            Upload video or text content for your course.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Lesson Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to React"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL (Optional)</Label>
              <Input
                id="video_url"
                placeholder="e.g. https://youtube.com/watch?v=..."
                {...register("video_url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_content">Text Content (Optional)</Label>
              <Textarea
                id="text_content"
                placeholder="Write your lesson content, instructions, or transcript here..."
                className="min-h-50"
                {...register("text_content")}
              />
            </div>

            {/* This displays the custom Zod error if BOTH are left empty */}
            {errors.root && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-200">
                {errors.root.message}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Lesson"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
