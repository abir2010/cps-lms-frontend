"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import {
  useGetCourseQuery,
  type Lesson,
} from "../../../../store/api/coursesApi";
import {
  useGetEnrollmentForCourseQuery,
  useUpdateEnrollmentProgressMutation,
} from "../../../../store/api/enrollmentsApi";

function getEmbedUrl(url: string) {
  if (!url) return "";
  const ytRegExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(ytRegExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function LearningInterface() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.documentId,
  );
  const { data: enrollment, isLoading: enrollmentLoading } =
    useGetEnrollmentForCourseQuery(params.documentId);
  const [updateProgress, { isLoading: isUpdating }] =
    useUpdateEnrollmentProgressMutation();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const activeLesson: Lesson | null =
    course?.lessons?.find((l) => l.documentId === activeLessonId) ??
    course?.lessons?.[0] ??
    null;

  useEffect(() => {
    if (!course || !enrollment) return;
    const total = course.lessons?.length || 0;
    const done = enrollment.completed_lessons?.length || 0;
    const trueProgress =
      total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

    if (trueProgress !== enrollment.progress_percentage) {
      updateProgress({
        documentId: enrollment.documentId,
        progress_percentage: trueProgress,
      });
    }
  }, [course, enrollment, updateProgress]);

  const isLessonCompleted = (lessonDocId: string) =>
    enrollment?.completed_lessons?.some((l) => l.documentId === lessonDocId);

  const handleMarkComplete = async () => {
    if (!course || !enrollment || !activeLesson) return;
    if (isLessonCompleted(activeLesson.documentId)) return;

    const total = course.lessons?.length || 0;
    const done = (enrollment.completed_lessons?.length || 0) + 1;
    const newProgress =
      total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

    await updateProgress({
      documentId: enrollment.documentId,
      progress_percentage: newProgress,
      completedLessonDocumentId: activeLesson.documentId,
    }).unwrap();
  };

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading curriculum...
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="p-8 text-center text-destructive">
        Course or enrollment not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Navigation & Progress */}
      <header className="border-b bg-card p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{course.title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/courses/${params.documentId}/quiz`)}
          >
            Take Quiz
          </Button>
          <div className="w-64 flex items-center space-x-4">
            <div className="text-sm font-medium">
              {enrollment.progress_percentage || 0}%
            </div>
            <Progress
              value={enrollment.progress_percentage || 0}
              className="h-2 w-full"
            />
          </div>
        </div>
      </header>

      {/* Main Learning Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Content Viewer */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/40">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeLesson.video_url && (
                <div className="aspect-video bg-slate-900 rounded-lg shadow-lg overflow-hidden relative w-full">
                  <iframe
                    src={getEmbedUrl(activeLesson.video_url)}
                    title={activeLesson.title}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{activeLesson.title}</h2>
                </div>

                <Button
                  onClick={handleMarkComplete}
                  disabled={
                    isUpdating || isLessonCompleted(activeLesson.documentId)
                  }
                  variant={
                    isLessonCompleted(activeLesson.documentId)
                      ? "secondary"
                      : "default"
                  }
                >
                  {isLessonCompleted(activeLesson.documentId) ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success" />{" "}
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              </div>

              {activeLesson.text_content && (
                <Card>
                  <CardContent className="p-6 prose max-w-none whitespace-pre-wrap text-foreground">
                    {activeLesson.text_content}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-20">
              No lessons available in this course yet.
            </div>
          )}
        </main>

        {/* Right Panel: Curriculum Sidebar */}
        <aside className="w-80 border-l bg-card overflow-y-auto shrink-0">
          <div className="p-4 font-semibold border-b bg-muted/40">
            Course Content
          </div>
          <div className="flex flex-col">
            {course.lessons?.map((lesson, index) => {
              const isActive = activeLesson?.documentId === lesson.documentId;
              const isDone = isLessonCompleted(lesson.documentId);

              return (
                <button
                  key={lesson.documentId}
                  onClick={() => setActiveLessonId(lesson.documentId)}
                  className={`p-4 text-left border-b hover:bg-muted/40 transition-colors flex items-start space-x-3 ${
                    isActive
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center text-xs text-muted-foreground">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-sm ${
                      isActive
                        ? "font-semibold text-primary"
                        : "font-medium text-foreground"
                    }`}
                  >
                    {lesson.title}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
