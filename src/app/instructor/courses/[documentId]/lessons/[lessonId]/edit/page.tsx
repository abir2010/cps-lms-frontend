"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppSelector } from "../../../../../../../store/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// Require title, and AT LEAST one of content or videoUrl
const lessonSchema = z
  .object({
    title: z.string().min(3, "Lesson title must be at least 3 characters."),
    videoUrl: z.string().optional(),
    content: z.string().optional(),
  })
  .refine((data) => data.content || data.videoUrl, {
    message: "You must provide either a video link, text content, or both.",
    path: ["root"],
  });

type LessonSchema = z.infer<typeof lessonSchema>;

export default function EditLessonPage() {
  const params = useParams();
  const documentId = params.documentId as string; // The parent course ID
  const lessonId = params.lessonId as string; // The specific lesson ID
  const router = useRouter();
  const { jwt } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Fetch the existing lesson data on mount
  useEffect(() => {
    const fetchLesson = async () => {
      if (!jwt || !lessonId) return;
      try {
        const res = await fetch(`${STRAPI_URL}/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message || "Failed to fetch lesson");
        }

        const lesson = data.data;

        // Pre-populate the form fields
        setValue("title", lesson.title);
        setValue("videoUrl", lesson.video_url || "");
        setValue("content", lesson.text_content || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [jwt, lessonId, setValue, STRAPI_URL]);

  const onSubmit = async (values: LessonSchema) => {
    try {
      // PUT request to update the existing lesson
      const res = await fetch(`${STRAPI_URL}/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title: values.title,
            video_url: values.videoUrl || null,
            text_content: values.content || null,
            type: values.videoUrl ? "video" : "text",
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to update lesson");
      }

      // Redirect back to the course edit page
      router.push(`/instructor/courses/${documentId}/edit`);
    } catch (error: any) {
      console.error(error);
      setError("root", { message: error.message || "Something went wrong." });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading lesson editor...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Lesson</h1>
          <p className="text-slate-500 mt-1">
            Update the video or text content for this lesson.
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
              <Label htmlFor="videoUrl">Video URL (Optional)</Label>
              <Input
                id="videoUrl"
                placeholder="e.g. https://youtube.com/watch?v=..."
                {...register("videoUrl")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Text Content (Optional)</Label>
              <Textarea
                id="content"
                placeholder="Write your lesson content, instructions, or transcript here..."
                className="min-h-50"
                {...register("content")}
              />
            </div>

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
                {isSubmitting ? "Saving..." : "Update Lesson"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
