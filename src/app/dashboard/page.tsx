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
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/store";

interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
}

interface Enrollment {
  id: number;
  progress_percentage: number;
  course: Course;
}

export default function StudentDashboard() {
  const { jwt, user } = useAppSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!jwt || !user) return;

      try {
        const headers = { Authorization: `Bearer ${jwt}` };

        // Fetch the user's specific enrollments and populate the related course
        const enrollmentsRes = await fetch(
          `${STRAPI_URL}/api/enrollments?filters[user][id][$eq]=${user.id}&populate=course`,
          { headers },
        );
        const enrollmentsData = await enrollmentsRes.json();
        const activeEnrollments = enrollmentsData.data || [];

        // Fetch all published courses
        const coursesRes = await fetch(`${STRAPI_URL}/api/courses`, {
          headers,
        });
        const coursesData = await coursesRes.json();
        const allCourses = coursesData.data || [];

        // Filter out courses the student is already enrolled in
        const enrolledCourseIds = activeEnrollments.map(
          (e: any) => e.course?.id,
        );
        const unstartedCourses = allCourses.filter(
          (course: Course) => !enrolledCourseIds.includes(course.id),
        );

        setEnrollments(activeEnrollments);
        setAvailableCourses(unstartedCourses);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [jwt, user, STRAPI_URL]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}
        </h1>
        <p className="text-slate-500 mt-2">
          Track your progress and discover new courses.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Your Learning Path</h2>
        {isLoading ? (
          <p className="text-slate-500">Loading your progress...</p>
        ) : enrollments.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-40 text-slate-500">
              <p>You haven&apos;t enrolled in any courses yet.</p>
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progress</span>
                      <span>{enrollment.progress_percentage || 0}%</span>
                    </div>
                    <Progress
                      value={enrollment.progress_percentage || 0}
                      className="h-2"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/courses/${enrollment.course?.documentId}`}
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

      {/* Available Courses Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>
        {isLoading ? (
          <p className="text-slate-500">Loading course catalog...</p>
        ) : availableCourses.length === 0 ? (
          <p className="text-slate-500">
            No new courses available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
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
