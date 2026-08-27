"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Compass } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useGetCoursesQuery } from "../../store/api/coursesApi";
import {
  useGetMyEnrollmentsQuery,
  useUpdateEnrollmentProgressMutation,
  type Enrollment,
} from "../../store/api/enrollmentsApi";
import { useAppSelector } from "../../store/store";

function computeProgress(enrollment: Enrollment): number {
  const total = enrollment.course?.lessons?.length || 0;
  const done = enrollment.completed_lessons?.length || 0;
  if (total === 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export default function StudentDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useGetMyEnrollmentsQuery();
  const { data: catalog, isLoading: catalogLoading } = useGetCoursesQuery();
  const [updateProgress] = useUpdateEnrollmentProgressMutation();

  useEffect(() => {
    enrollments?.forEach((enrollment) => {
      const trueProgress = computeProgress(enrollment);
      if (trueProgress !== enrollment.progress_percentage) {
        updateProgress({
          documentId: enrollment.documentId,
          progress_percentage: trueProgress,
        });
      }
    });
  }, [enrollments, updateProgress]);

  const isLoading = enrollmentsLoading || catalogLoading;
  const enrolledCourseIds = new Set(
    (enrollments ?? []).map((e) => e.course?.documentId),
  );
  const availableCourses = (catalog ?? []).filter(
    (course) => !enrolledCourseIds.has(course.documentId),
  );

  if (isLoading) {
    return (
      <div className="p-8 text-slate-500">Loading your learning hub...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}
        </h1>
        <p className="text-slate-500 mt-2">
          Pick up where you left off or discover something new.
        </p>
      </header>

      {/* Enrolled Courses Section */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-semibold">Your Learning Path</h2>
        </div>

        {!enrollments || enrollments.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-32 text-slate-500">
              <p>You are not enrolled in any courses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const progress = computeProgress(enrollment);
              return (
                <Card key={enrollment.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {enrollment.course?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/courses/${enrollment.course?.documentId}/learn`}
                      className="w-full"
                    >
                      <Button className="w-full">Continue Learning</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Course Catalog Section */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-semibold">Available Courses</h2>
        </div>

        {availableCourses.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-32 text-slate-500">
              <p>You have enrolled in all available courses!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <p className="text-xs text-slate-400">
                    By {course.instructor?.username || "Platform Instructor"}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {course.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/courses/${course.documentId}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
