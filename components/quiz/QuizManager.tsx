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
  useAddQuizQuestionMutation,
  useDeleteQuizQuestionMutation,
  useGetQuizForCourseQuery,
  useUpdateQuizQuestionMutation,
} from "@/src/store/api/quizApi";
import {
  QuizQuestionForm,
  type QuizQuestionFormValues,
} from "./QuizQuestionForm";

interface QuizManagerProps {
  courseId: number;
  courseDocumentId: string;
}

export function QuizManager({ courseId, courseDocumentId }: QuizManagerProps) {
  const { data: questions } = useGetQuizForCourseQuery(courseDocumentId);
  const [addQuestion, { isLoading: isAdding }] = useAddQuizQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuizQuestionMutation();
  const [deleteQuestion] = useDeleteQuizQuestionMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const list = questions ?? [];

  const handleAdd = async (values: QuizQuestionFormValues) => {
    await addQuestion({ ...values, course: courseId, courseDocumentId }).unwrap();
    setIsAddingOpen(false);
  };

  const handleUpdate = async (documentId: string, values: QuizQuestionFormValues) => {
    await updateQuestion({ documentId, courseDocumentId, data: values }).unwrap();
    setEditingId(null);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Remove this question?")) return;
    await deleteQuestion({ documentId, courseDocumentId }).unwrap();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">
            No quiz questions yet. Add your first one below.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {list.map((q, index) =>
              editingId === q.documentId ? (
                <li key={q.documentId} className="px-4 py-4">
                  <QuizQuestionForm
                    submitLabel="Save Question"
                    isSubmitting={isUpdating}
                    initialValues={{
                      question: q.question,
                      option_a: q.option_a,
                      option_b: q.option_b,
                      option_c: q.option_c,
                      option_d: q.option_d,
                      correct_answer: q.correct_answer ?? "A",
                    }}
                    onSubmit={(values) => handleUpdate(q.documentId, values)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li
                  key={q.documentId}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {index + 1}. {q.question}
                    </p>
                    <p className="text-xs text-slate-500">
                      Correct answer: {q.correct_answer ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(q.documentId)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(q.documentId)}
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
              <h3 className="font-semibold">Add a Question</h3>
              <QuizQuestionForm
                submitLabel="Add Question"
                isSubmitting={isAdding}
                onSubmit={handleAdd}
                onCancel={() => setIsAddingOpen(false)}
              />
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsAddingOpen(true)}>
              Add Question
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
