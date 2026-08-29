"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/shared/field-error";
import { Loader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCourseMutation } from "@/src/store/api/coursesApi";

const courseSchema = z.object({
  title: z.string().min(5, "Course title must be at least 5 characters."),
  description: z
    .string()
    .min(20, "Please provide a detailed description (min 20 characters)."),
});

type CourseSchema = z.infer<typeof courseSchema>;

interface CourseFormProps {
  editPathFor: (documentId: string) => string;
  listPath: string;
}

export function CourseForm({ editPathFor, listPath }: CourseFormProps) {
  const router = useRouter();
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CourseSchema>({ resolver: zodResolver(courseSchema) });

  const onSubmit = async (values: CourseSchema) => {
    try {
      const course = await createCourse(values).unwrap();
      router.push(editPathFor(course.documentId));
    } catch (err: any) {
      setError("root", {
        message: err?.data?.error?.message ?? "Failed to create course.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Draft New Course</h1>
        <p className="text-muted-foreground mt-2">
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
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Explain what students will learn in this course..."
                className="min-h-37.5"
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <FieldError message={errors.root?.message} />

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(listPath)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader size="sm" label="Saving Draft..." />
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
