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
import { BookOpen, Calendar, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";

interface Course {
  documentId: string;
  title: string;
  description: string;
  publishedAt: string;
  instructor?: {
    username: string;
  };
}

export default function CourseDetailsPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const router = useRouter();

  const { jwt, user } = useAppSelector((state) => state.auth);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!jwt || !documentId) return;
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/courses/${documentId}?populate=instructor`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          },
        );
        const data = await res.json();

        if (res.ok) {
          setCourse(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [jwt, documentId, STRAPI_URL]);

  // Handle Enrollment
  const handleEnrollment = async () => {
    if (!jwt || !user?.documentId || !course) return;

    setIsEnrolling(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            progress_percentage: 0,
            student: user.documentId, // Links to the logged-in student
            course: course.documentId, // Links to the current course
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to enroll");
      }

      // Redirect back to the dashboard so they can see their new active course
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Could not complete enrollment. Please check your permissions.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading course information...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center text-red-500">Course not found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">
          Course Preview
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {course.title}
        </h1>

        <div className="flex items-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>
              Instructor: {course.instructor?.username || "Platform Instructor"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>
              Published: {new Date(course.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span>About this course</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
            {course.description || "No description provided for this course."}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-6 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Ready to start learning? Enroll now for free.
          </div>
          <Button size="lg" onClick={handleEnrollment} disabled={isEnrolling}>
            {isEnrolling ? "Processing..." : "Enroll Now"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
