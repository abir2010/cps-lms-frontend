"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useAddLessonMutation,
  useDeleteLessonMutation,
  useUpdateLessonMutation,
  type Lesson,
} from "@/src/store/api/coursesApi";
import { LessonForm, type LessonFormValues } from "./LessonForm";

interface LessonManagerProps {
  courseId: number;
  courseDocumentId: string;
  lessons: Lesson[];
}

export function LessonManager({
  courseId,
  courseDocumentId,
  lessons,
}: LessonManagerProps) {
  const [addLesson, { isLoading: isAdding }] = useAddLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingOpen, setIsAddingOpen] = useState(lessons.length === 0);

  const handleAdd = async (values: LessonFormValues) => {
    await addLesson({
      title: values.title,
      type: values.type,
      text_content: values.type === "text" ? values.content : undefined,
      video_url: values.type === "video" ? values.content : undefined,
      sequence_order: lessons.length + 1,
      course: courseId,
      courseDocumentId,
    }).unwrap();
    setIsAddingOpen(false);
  };

  const handleUpdate = async (documentId: string, values: LessonFormValues) => {
    await updateLesson({
      documentId,
      courseDocumentId,
      data: {
        title: values.title,
        type: values.type,
        text_content: values.type === "text" ? values.content : null,
        video_url: values.type === "video" ? values.content : null,
      },
    }).unwrap();
    setEditingId(null);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Remove this lesson?")) return;
    await deleteLesson({ documentId, courseDocumentId }).unwrap();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lessons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {lessons.length === 0 ? (
          <p className="text-sm text-slate-500">
            No lessons yet. Add your first one below.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {lessons.map((lesson, index) =>
              editingId === lesson.documentId ? (
                <li key={lesson.documentId} className="px-4 py-4">
                  <LessonForm
                    submitLabel="Save Lesson"
                    isSubmitting={isUpdating}
                    initialValues={{
                      title: lesson.title,
                      type: lesson.type,
                      content:
                        (lesson.type === "text"
                          ? lesson.text_content
                          : lesson.video_url) ?? "",
                    }}
                    onSubmit={(values) => handleUpdate(lesson.documentId, values)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li
                  key={lesson.documentId}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-6">
                      {lesson.sequence_order ?? index + 1}.
                    </span>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.type === "video" ? "Video" : "Text"} lesson
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(lesson.documentId)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(lesson.documentId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}

        <div className="border-t pt-6">
          {isAddingOpen ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Add a Lesson</h3>
              <LessonForm
                submitLabel="Add Lesson"
                isSubmitting={isAdding}
                onSubmit={handleAdd}
                onCancel={lessons.length > 0 ? () => setIsAddingOpen(false) : undefined}
              />
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsAddingOpen(true)}>
              Add Another Lesson
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
