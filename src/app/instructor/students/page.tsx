"use client";

import { CourseBarChart } from "@/components/dashboard/course-bar-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Loader } from "@/components/shared/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, GraduationCap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useGetMyCoursesEnrollmentsQuery } from "../../../store/api/enrollmentsApi";

export default function InstructorStudentsPage() {
  const { data: enrollments, isLoading } = useGetMyCoursesEnrollmentsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Loader label="Loading student progress..." />
      </div>
    );
  }

  const rows = enrollments ?? [];

  const byCourse = new Map<string, { title: string; rows: typeof rows }>();
  for (const enrollment of rows) {
    const key = enrollment.course?.documentId ?? "unknown";
    const entry = byCourse.get(key) ?? {
      title: enrollment.course?.title ?? "Untitled course",
      rows: [],
    };
    entry.rows.push(enrollment);
    byCourse.set(key, entry);
  }
  const courses = Array.from(byCourse.values());

  const uniqueStudents = new Set(
    rows.map((r) => r.student?.id).filter(Boolean),
  );
  const averageCompletion = rows.length
    ? Math.round(
        rows.reduce((s, r) => s + (r.progress_percentage || 0), 0) /
          rows.length,
      )
    : 0;

  const chartData = courses.map((c) => ({
    course: c.title,
    value: c.rows.length
      ? Math.round(
          c.rows.reduce((s, r) => s + (r.progress_percentage || 0), 0) /
            c.rows.length,
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
          Course Completion by Student
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every student enrolled across your courses, and how far along they
          are.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Enrolled students"
          value={String(uniqueStudents.size)}
          index={0}
        />
        <StatCard
          icon={GraduationCap}
          label="Total enrollments"
          value={String(rows.length)}
          index={1}
        />
        <StatCard
          icon={TrendingUp}
          label="Average completion"
          value={`${averageCompletion}%`}
          index={2}
        />
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed bg-muted/40">
          <CardContent className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <p>No students are enrolled in any of your courses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CourseBarChart
            title="Average completion by course"
            subtitle="Mean progress across every enrolled student"
            data={chartData}
          />

          <div className="space-y-6">
            {courses.map((course) => (
              <Card key={course.title}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.rows.length} student
                    {course.rows.length === 1 ? "" : "s"} enrolled
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y rounded-md border">
                    {course.rows.map((enrollment) => (
                      <li
                        key={enrollment.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {enrollment.student?.username}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {enrollment.student?.email}
                          </p>
                        </div>
                        <div className="flex w-40 shrink-0 items-center gap-3">
                          <Progress
                            value={enrollment.progress_percentage || 0}
                            className="h-2"
                          />
                          <span className="w-10 text-right text-sm font-medium text-foreground">
                            {enrollment.progress_percentage || 0}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
