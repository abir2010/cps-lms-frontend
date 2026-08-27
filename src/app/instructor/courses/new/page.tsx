"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppSelector } from "../../../../store/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const courseSchema = z.object({
  title: z.string().min(5, "Course title must be at least 5 characters."),
  description: z
    .string()
    .min(20, "Please provide a detailed description (min 20 characters)."),
});

type CourseSchema = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const { jwt, user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CourseSchema>({
    resolver: zodResolver(courseSchema),
  });

  const onSubmit = async (values: CourseSchema) => {
    if (!jwt || !user) return;

    try {
      const STRAPI_URL =
        process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

      const res = await fetch(`${STRAPI_URL}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title: values.title,
            description: values.description,
            instructor: user.documentId,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to create course");
      }

      const { data: created } = await res.json();

      // Head straight into the new course so lessons can be added right away.
      router.push(`/instructor/courses/${created.documentId}/edit`);
    } catch (error: any) {
      console.error(error);
      setError("root", { message: error.message || "Something went wrong." });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Draft New Course</h1>
        <p className="text-slate-500 mt-2">
          Set up the foundational details for your curriculum.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Advanced Algorithms"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm font-medium text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Explain what students will learn in this course..."
                className="min-h-37.5"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm font-medium text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm font-medium text-destructive">
                {errors.root.message}
              </p>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/instructor/courses")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving Draft..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
