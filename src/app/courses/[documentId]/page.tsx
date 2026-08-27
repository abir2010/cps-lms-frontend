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
import { useState } from "react";
import { useGetCourseQuery } from "../../../store/api/coursesApi";
import { useEnrollMutation } from "../../../store/api/enrollmentsApi";

export default function CourseDetailsPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  const { data: course, isLoading } = useGetCourseQuery(params.documentId);
  const [enroll, { isLoading: isEnrolling }] = useEnrollMutation();
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const handleEnrollment = async () => {
    if (!course) return;
    setEnrollError(null);
    try {
      await enroll(course.documentId).unwrap();
      router.push("/dashboard");
    } catch (err: any) {
      setEnrollError(
        err?.data?.error?.message ??
          "Could not complete enrollment. Please check your permissions.",
      );
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
          {course.publishedAt && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                Published: {new Date(course.publishedAt).toLocaleDateString()}
              </span>
            </div>
          )}
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
        <CardFooter className="bg-slate-50 border-t p-6 flex flex-col items-end gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Ready to start learning? Enroll now for free.
            </div>
            <Button size="lg" onClick={handleEnrollment} disabled={isEnrolling}>
              {isEnrolling ? "Processing..." : "Enroll Now"}
            </Button>
          </div>
          {enrollError && (
            <p className="text-sm font-medium text-destructive">
              {enrollError}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
