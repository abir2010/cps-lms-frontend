"use client";

import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { StatCard } from "@/components/dashboard/stat-card";
import { Loader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BookOpen, Compass, Flame, GraduationCap } from "lucide-react";
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
      <div className="flex justify-center p-16">
        <Loader label="Loading your learning hub..." />
      </div>
    );
  }

  const progressData = (enrollments ?? []).map((enrollment) => ({
    name: enrollment.course?.title ?? "Untitled course",
    progress: computeProgress(enrollment),
  }));
  const averageProgress = progressData.length
    ? Math.round(
        progressData.reduce((s, d) => s + d.progress, 0) / progressData.length,
      )
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick up where you left off or discover something new.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Active courses"
          value={String(progressData.length)}
          index={0}
        />
        <StatCard
          icon={Flame}
          label="Average progress"
          value={`${averageProgress}%`}
          index={1}
        />
        <StatCard
          icon={GraduationCap}
          label="Available courses"
          value={String(availableCourses.length)}
          index={2}
        />
      </div>

      {progressData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section>
            <div className="mb-4 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Your Learning Path
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {(enrollments ?? []).map((enrollment, i) => {
                const progress = computeProgress(enrollment);
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                  >
                    <Card className="flex h-full flex-col">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          {enrollment.course?.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm font-medium text-foreground">
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
                  </motion.div>
                );
              })}
            </div>
          </section>

          <ProgressOverview data={progressData} />
        </div>
      )}

      {progressData.length === 0 && (
        <section>
          <div className="mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Your Learning Path
            </h2>
          </div>
          <Card className="border-dashed bg-muted/40">
            <CardContent className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <p>You are not enrolled in any courses yet.</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Course Catalog Section */}
      <section>
        <div className="mb-4 flex items-center space-x-2">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">
            Available Courses
          </h2>
        </div>

        {availableCourses.length === 0 ? (
          <Card className="border-dashed bg-muted/40">
            <CardContent className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <p>You have enrolled in all available courses!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <Card className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {course.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      By {course.instructor?.username || "Platform Instructor"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
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
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
