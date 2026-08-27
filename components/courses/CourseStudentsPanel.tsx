"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGetCourseEnrollmentsQuery } from "@/src/store/api/enrollmentsApi";

interface CourseStudentsPanelProps {
  courseDocumentId: string;
}

/**
 * Enrolled students + their progress for one course. The backend already
 * scopes `getCourseEnrollments` to "own courses only" for an Instructor, so
 * this single component is safe to reuse on the Instructor, Content Manager
 * and Admin course-edit screens without any extra role branching here.
 */
export function CourseStudentsPanel({
  courseDocumentId,
}: CourseStudentsPanelProps) {
  const { data: enrollments, isLoading } =
    useGetCourseEnrollmentsQuery(courseDocumentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading enrolled students...</p>
        ) : !enrollments || enrollments.length === 0 ? (
          <p className="text-sm text-slate-500">
            No students are enrolled in this course yet.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {enrollment.student?.username}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {enrollment.student?.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <Progress
                    value={enrollment.progress_percentage || 0}
                    className="h-2"
                  />
                  <span className="text-sm font-medium w-10 text-right">
                    {enrollment.progress_percentage || 0}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
