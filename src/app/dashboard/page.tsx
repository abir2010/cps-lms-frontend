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
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/store";

interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  instructor?: { username: string };
  lessons?: any[]; // Added to calculate total lessons
}

interface Enrollment {
  id: number;
  documentId: string;
  progress_percentage: number;
  course: Course;
  completed_lessons?: any[]; // Added to calculate completed lessons
}

export default function StudentDashboard() {
  const { jwt, user } = useAppSelector((state) => state.auth);

  const [catalog, setCatalog] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for Redux to load the auth state
      if (!jwt || !user) return;

      // If the user is loaded but missing the documentId, stop loading
      if (!user.documentId) {
        console.error(
          "Missing documentId in Redux state. Please log out and back in.",
        );
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user's enrollments with deep population for both course lessons and completed lessons
        const enrollmentsRes = await fetch(
          `${STRAPI_URL}/api/enrollments?filters[student][documentId][$eq]=${user.documentId}&populate[0]=course.lessons&populate[1]=completed_lessons`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );

        // Fetch the platform's available course catalog
        const catalogRes = await fetch(
          `${STRAPI_URL}/api/courses?populate=instructor`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );

        const enrollmentsData = await enrollmentsRes.json();
        const catalogData = await catalogRes.json();

        const fetchedEnrollments: Enrollment[] = enrollmentsData.data || [];
        const fetchedCatalog: Course[] = catalogData.data || [];

        const enrolledCourseIds = new Set<string>();

        // 3. Process enrollments: recalculate progress and collect enrolled course IDs
        const processedEnrollments = fetchedEnrollments.map((enrollment) => {
          if (enrollment.course?.documentId) {
            enrolledCourseIds.add(enrollment.course.documentId);
          }

          // --- SELF-HEALING PROGRESS CALCULATION ---
          const totalLessons = enrollment.course?.lessons?.length || 0;
          const completedCount = enrollment.completed_lessons?.length || 0;
          let trueProgress = 0;

          if (totalLessons > 0) {
            trueProgress = Math.round((completedCount / totalLessons) * 100);
          }
          if (trueProgress > 100) trueProgress = 100;

          // If the database is stale (e.g. course size changed), fix it silently
          if (trueProgress !== enrollment.progress_percentage) {
            enrollment.progress_percentage = trueProgress; // Update local UI state instantly

            // Fire a background sync to patch Strapi
            fetch(`${STRAPI_URL}/api/enrollments/${enrollment.documentId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify({
                data: { progress_percentage: trueProgress },
              }),
            }).catch((err) =>
              console.error("Failed to background sync progress", err),
            );
          }

          return enrollment;
        });

        // 4. Filter the catalog to hide courses the user is already enrolled in
        const availableCourses = fetchedCatalog.filter(
          (course) => !enrolledCourseIds.has(course.documentId),
        );

        setEnrollments(processedEnrollments);
        setCatalog(availableCourses);
      } catch (error) {
        console.log("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [jwt, user, STRAPI_URL]);

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

        {enrollments.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-32 text-slate-500">
              <p>You are not enrolled in any courses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
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
                      <span>{enrollment.progress_percentage || 0}%</span>
                    </div>
                    <Progress
                      value={enrollment.progress_percentage || 0}
                      className="w-full"
                    />
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
            ))}
          </div>
        )}
      </section>

      {/* Course Catalog Section */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-semibold">Available Courses</h2>
        </div>

        {catalog.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-32 text-slate-500">
              <p>You have enrolled in all available courses!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((course) => (
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
