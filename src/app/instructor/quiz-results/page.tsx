"use client";

import { CourseBarChart } from "@/components/dashboard/course-bar-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Loader } from "@/components/shared/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ListChecks, Percent, Users } from "lucide-react";
import Link from "next/link";
import {
  useGetInstructorQuizResultsQuery,
  type QuizResult,
} from "../../../store/api/quizApi";

function groupByStudent(results: QuizResult[]) {
  const byStudent = new Map<
    number,
    { username: string; correct: number; total: number }
  >();
  for (const result of results) {
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

export default function InstructorQuizResultsPage() {
  const { data: results, isLoading } = useGetInstructorQuizResultsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Loader label="Loading quiz results..." />
      </div>
    );
  }

  const rows = results ?? [];

  const byCourse = new Map<string, { title: string; rows: QuizResult[] }>();
  for (const result of rows) {
    const key = result.quiz?.course?.documentId ?? "unknown";
    const entry = byCourse.get(key) ?? {
      title: result.quiz?.course?.title ?? "Untitled course",
      rows: [],
    };
    entry.rows.push(result);
    byCourse.set(key, entry);
  }
  const courses = Array.from(byCourse.values());

  const uniqueStudents = new Set(
    rows.map((r) => r.student?.id).filter(Boolean),
  );
  const overallAccuracy = rows.length
    ? Math.round((rows.filter((r) => r.score > 0).length / rows.length) * 100)
    : 0;

  const chartData = courses.map((c) => ({
    course: c.title,
    value: c.rows.length
      ? Math.round(
          (c.rows.filter((r) => r.score > 0).length / c.rows.length) * 100,
        )
      : 0,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Quiz Results
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every quiz attempt across your courses, grouped by course and student.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Students attempted"
          value={String(uniqueStudents.size)}
          index={0}
        />
        <StatCard
          icon={ListChecks}
          label="Total attempts"
          value={String(rows.length)}
          index={1}
        />
        <StatCard
          icon={Percent}
          label="Overall accuracy"
          value={`${overallAccuracy}%`}
          index={2}
        />
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed bg-muted/40">
          <CardContent className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <p>No students have taken a quiz in any of your courses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CourseBarChart
            title="Accuracy by course"
            subtitle="Share of correct answers across all attempts"
            data={chartData}
          />

          <div className="space-y-6">
            {courses.map((course) => {
              const studentRows = groupByStudent(course.rows);
              return (
                <Card key={course.title}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {studentRows.length} student
                      {studentRows.length === 1 ? "" : "s"} attempted
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y rounded-md border">
                      {studentRows.map((row) => (
                        <li
                          key={row.username}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="font-medium text-foreground">
                            {row.username}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {row.correct} / {row.total} correct (
                            {Math.round((row.correct / row.total) * 100)}%)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
