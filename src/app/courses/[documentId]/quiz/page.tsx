"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetCourseQuery } from "@/src/store/api/coursesApi";
import {
  useGetMyQuizResultsQuery,
  useGetQuizForCourseQuery,
  useSubmitQuizAnswerMutation,
  type QuizOption,
} from "@/src/store/api/quizApi";
import { CheckCircle2, ChevronLeft, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const OPTIONS: {
  key: QuizOption;
  field: "option_a" | "option_b" | "option_c" | "option_d";
}[] = [
  { key: "A", field: "option_a" },
  { key: "B", field: "option_b" },
  { key: "C", field: "option_c" },
  { key: "D", field: "option_d" },
];

export default function TakeQuizPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  const { data: course } = useGetCourseQuery(params.documentId);
  const { data: questions, isLoading: questionsLoading } =
    useGetQuizForCourseQuery(params.documentId);
  const { data: results, isLoading: resultsLoading } = useGetMyQuizResultsQuery(
    params.documentId,
  );
  const [submitAnswer] = useSubmitQuizAnswerMutation();

  const [selections, setSelections] = useState<Record<string, QuizOption>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLoading = questionsLoading || resultsLoading;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading quiz...
      </div>
    );
  }

  const backToCourse = () => router.push(`/courses/${params.documentId}/learn`);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={backToCourse}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Course
        </Button>
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            No quiz is available for this course yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  const resultByQuestionId = new Map(
    (results ?? []).map((r) => [r.quiz?.documentId, r]),
  );
  const allAnswered = questions.every((q) =>
    resultByQuestionId.has(q.documentId),
  );
  const correctCount = (results ?? []).filter((r) => r.score > 0).length;

  const handleSelect = (questionId: string, option: QuizOption) => {
    setSelections((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const unanswered = questions.filter(
      (q) => !resultByQuestionId.has(q.documentId),
    );
    const missing = unanswered.filter((q) => !selections[q.documentId]);
    if (missing.length > 0) {
      setSubmitError("Please answer every question before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        unanswered.map((q) =>
          submitAnswer({
            quiz: q.id,
            selected_answer: selections[q.documentId],
            courseDocumentId: params.documentId,
          }).unwrap(),
        ),
      );
    } catch (err: any) {
      setSubmitError(
        err?.data?.error?.message ??
          "Failed to submit the quiz. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={backToCourse}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Course
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {course?.title ? `${course.title} — Quiz` : "Quiz"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {allAnswered
            ? "You've completed this quiz. Here's how you did."
            : "Answer every question, then submit."}
        </p>
      </div>

      {allAnswered && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="py-6 text-center">
            <p className="text-3xl font-bold text-primary">
              {correctCount} / {questions.length}
            </p>
            <p className="text-sm text-primary mt-1">
              {Math.round((correctCount / questions.length) * 100)}% correct
            </p>
          </CardContent>
        </Card>
      )}

      {questions.map((q, index) => {
        const existingResult = resultByQuestionId.get(q.documentId);
        const isAnswered = !!existingResult;
        const selected = isAnswered
          ? existingResult.selected_answer
          : selections[q.documentId];

        return (
          <Card key={q.documentId}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {index + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {OPTIONS.map(({ key, field }) => {
                const isSelected = selected === key;
                const isCorrectOption =
                  isAnswered && existingResult.quiz?.correct_answer === key;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelect(q.documentId, key)}
                    className={`w-full flex items-center justify-between gap-3 rounded-md border px-4 py-2 text-left text-sm transition-colors ${
                      isAnswered
                        ? isCorrectOption
                          ? "bg-success/10 border-success/30"
                          : isSelected
                            ? "bg-destructive/10 border-destructive/30"
                            : "bg-card border-border"
                        : isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <span>
                      <span className="font-medium mr-2">{key}.</span>
                      {q[field]}
                    </span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {!allAnswered && (
        <div className="space-y-3">
          {submitError && (
            <p className="text-sm font-medium text-destructive">
              {submitError}
            </p>
          )}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      )}
    </div>
  );
}
