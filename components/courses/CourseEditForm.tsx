"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteCourseMutation,
  useGetCourseQuery,
  useUpdateCourseMutation,
} from "@/src/store/api/coursesApi";
import { useAppSelector } from "@/src/store/store";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuizManager } from "../quiz/QuizManager";
import { CourseStudentsPanel } from "./CourseStudentsPanel";
import { LessonManager } from "./LessonManager";

interface CourseEditFormProps {
  documentId: string;
  listPath: string;
}

export function CourseEditForm({ documentId, listPath }: CourseEditFormProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const { data: course, isLoading, error } = useGetCourseQuery(documentId);
  const [updateCourse, { isLoading: isSaving }] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-slate-500">Loading course...</p>;
  }

  if (error || !course) {
    return (
      <Card className="bg-slate-50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-40 text-slate-500">
          <p>Course not found.</p>
        </CardContent>
      </Card>
    );
  }

  const titleValue = title ?? course.title;
  const descriptionValue = description ?? course.description;
  const isOwner = !course.instructor || course.instructor.id === user?.id;

  const handleSave = async () => {
    setCourseError(null);
    try {
      await updateCourse({
        documentId,
        data: { title: titleValue, description: descriptionValue },
      }).unwrap();
    } catch (err: any) {
      setCourseError(err?.data?.error?.message ?? "Failed to save course.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this course and all of its lessons?")) return;
    await deleteCourse(documentId).unwrap();
    router.push(listPath);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-slate-500 mt-2">
            Update the course details and build out its lessons.
          </p>
        </div>
        <Badge variant={course.publishedAt ? "default" : "secondary"}>
          {course.publishedAt ? "Published" : "Draft"}
        </Badge>
      </div>

      {!isOwner && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
          This course belongs to another instructor (
          {course.instructor?.username}
          ).
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={titleValue}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              className="min-h-30"
              value={descriptionValue}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {courseError && (
            <p className="text-sm font-medium text-destructive">
              {courseError}
            </p>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Course
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <LessonManager
        courseId={course.id}
        courseDocumentId={course.documentId}
        lessons={course.lessons ?? []}
      />

      <QuizManager courseId={course.id} courseDocumentId={course.documentId} />

      <CourseStudentsPanel courseDocumentId={course.documentId} />
    </div>
  );
}
