"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";

interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  publishedAt: string | null;
}

export default function InstructorCoursesPage() {
  const { jwt, user } = useAppSelector((state) => state.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!jwt || !user) return;
      try {
        // Filter courses where the instructor relation matches the logged-in user's ID
        const res = await fetch(
          `${STRAPI_URL}/api/courses?filters[instructor][id][$eq]=${user.id}`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );
        const data = await res.json();
        setCourses(data.data || []);
      } catch (error) {
        console.error("Failed to fetch instructor courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyCourses();
  }, [jwt, user, STRAPI_URL]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-slate-500 mt-2">
            Manage your curriculum and content modules.
          </p>
        </div>
        <Link href="/instructor/courses/new">
          <Button>Create New Course</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading your courses...</p>
      ) : courses.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-40 text-slate-500">
            <p>You haven&apos;t created any courses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <Badge variant={course.publishedAt ? "default" : "secondary"}>
                    {course.publishedAt ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500 line-clamp-3">
                  {course.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="space-x-2">
                {/* We will build the edit page later */}
                <Link
                  href={`/instructor/courses/${course.documentId}/edit`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Edit Course
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
