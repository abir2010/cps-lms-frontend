"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppSelector } from "../../../../../store/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignLeft,
  GripVertical,
  PlayCircle,
  PlusCircle,
  Trash2,
} from "lucide-react";

const courseSchema = z.object({
  title: z.string().min(5, "Course title must be at least 5 characters."),
  description: z
    .string()
    .min(20, "Please provide a detailed description (min 20 characters)."),
});

type CourseSchema = z.infer<typeof courseSchema>;

interface Lesson {
  id: number;
  documentId: string;
  title: string;
  videoUrl?: string;
  content?: string;
}

export default function EditCoursePage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const router = useRouter();
  const { jwt } = useAppSelector((state) => state.auth);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CourseSchema>({
    resolver: zodResolver(courseSchema),
  });

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchCourse = async () => {
      if (!jwt || !documentId) return;
      try {
        // Fetch course and populate the lessons relation
        const res = await fetch(
          `${STRAPI_URL}/api/courses/${documentId}?populate=lessons`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          },
        );
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.error?.message || "Failed to fetch course");

        const course = data.data;
        setValue("title", course.title);
        setValue("description", course.description || "");
        setLessons(course.lessons || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [jwt, documentId, setValue, STRAPI_URL]);

  const onSubmit = async (values: CourseSchema) => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/courses/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title: values.title,
            description: values.description,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to update course");
      router.push("/instructor/courses");
    } catch (error: any) {
      console.error(error);
      setError("root", { message: error.message || "Something went wrong." });
    }
  };

  const handleDeleteLesson = async (lessonDocId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this lesson? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${STRAPI_URL}/api/lessons/${lessonDocId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete lesson");
      }

      // Remove the deleted lesson from the local UI state immediately
      setLessons((prev) =>
        prev.filter((lesson) => lesson.documentId !== lessonDocId),
      );
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Could not delete the lesson. Please check your permissions.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-500">Loading course details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
        <p className="text-slate-500 mt-2">
          Manage your course details and curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    className="min-h-37.5"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Update Details"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Curriculum Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Curriculum</CardTitle>
              <Button
                onClick={() =>
                  router.push(`/instructor/courses/${documentId}/lessons/new`)
                }
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-500">
                  <p>No lessons added yet.</p>
                  <p className="text-sm mt-1">
                    Click &quot;Add Lesson&quot; to start building your
                    curriculum.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.documentId}
                      className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {index + 1}. {lesson.title}
                          </span>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                            {lesson.videoUrl && (
                              <span className="flex items-center">
                                <PlayCircle className="h-3 w-3 mr-1" /> Video
                              </span>
                            )}
                            {lesson.content && (
                              <span className="flex items-center">
                                <AlignLeft className="h-3 w-3 mr-1" /> Text
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/instructor/courses/${documentId}/lessons/${lesson.documentId}/edit`,
                            )
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteLesson(lesson.documentId)}
                          title="Delete Lesson"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
