"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetCourseQuizResultsQuery } from "@/src/store/api/quizApi";

interface QuizResultsPanelProps {
  courseDocumentId: string;
}

function groupByStudent(
  results: ReturnType<typeof useGetCourseQuizResultsQuery>["data"],
) {
  const byStudent = new Map<
    number,
    { username: string; correct: number; total: number }
  >();

  for (const result of results ?? []) {
    if (!result.student) continue;
    const entry = byStudent.get(result.student.id) ?? {
      username: result.student.username,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    entry.correct += result.score ? 1 : 0;
    byStudent.set(result.student.id, entry);
  }

  return Array.from(byStudent.values());
}

export function QuizResultsPanel({ courseDocumentId }: QuizResultsPanelProps) {
  const { data: results, isLoading } =
    useGetCourseQuizResultsQuery(courseDocumentId);
  const rows = groupByStudent(results);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading quiz results...
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No students have taken this course&apos;s quiz yet.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {rows.map((row) => (
              <li
                key={row.username}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="font-medium">{row.username}</span>
                <span className="text-sm text-muted-foreground">
                  {row.correct} / {row.total} correct (
                  {Math.round((row.correct / row.total) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
