"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Loader } from "@/components/shared/loader";
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
  const [enroll] = useEnrollMutation();
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [confirmingEnroll, setConfirmingEnroll] = useState(false);

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
      <div className="flex justify-center p-16">
        <Loader label="Loading course information..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center text-destructive">Course not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">
          Course Preview
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {course.title}
        </h1>

        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
            <BookOpen className="h-5 w-5 text-primary" />
            <span>About this course</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none whitespace-pre-wrap text-foreground/90">
            {course.description || "No description provided for this course."}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-end gap-3 border-t bg-muted/40 p-6">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Ready to start learning? Enroll now for free.
            </div>
            <Button size="lg" onClick={() => setConfirmingEnroll(true)}>
              Enroll Now
            </Button>
          </div>
          {enrollError && (
            <p className="text-sm font-medium text-destructive">
              {enrollError}
            </p>
          )}
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={confirmingEnroll}
        onOpenChange={setConfirmingEnroll}
        title={`Enroll in "${course.title}"?`}
        description="You'll get full access to every lesson and can start learning right away."
        confirmLabel="Confirm enrollment"
        tone="positive"
        onConfirm={handleEnrollment}
      />
    </div>
  );
}
