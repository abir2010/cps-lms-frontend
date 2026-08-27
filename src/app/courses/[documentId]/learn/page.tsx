"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../store/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronLeft } from "lucide-react";

// --- Type Definitions ---
interface Lesson {
  id: number;
  documentId: string;
  title: string;
  text_content?: string; // Matched to Strapi
  video_url?: string; // Matched to Strapi
}

interface Course {
  documentId: string;
  title: string;
  lessons: Lesson[];
}

interface Enrollment {
  documentId: string;
  progress_percentage: number;
  completed_lessons: Lesson[];
}

export default function LearningInterface() {
  const params = useParams();
  const courseId = params.documentId as string;
  const router = useRouter();

  const { jwt, user } = useAppSelector((state) => state.auth);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchLearningData = async () => {
      if (!jwt || !user?.documentId || !courseId) return;

      try {
        // Fetch the Course and the Enrollment
        const courseRes = await fetch(
          `${STRAPI_URL}/api/courses/${courseId}?populate=lessons`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );

        const enrollmentRes = await fetch(
          `${STRAPI_URL}/api/enrollments?filters[student][documentId][$eq]=${user.documentId}&filters[course][documentId][$eq]=${courseId}&populate=completed_lessons`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );

        const courseData = await courseRes.json();
        const enrollmentData = await enrollmentRes.json();

        let fetchedCourse = null;
        let fetchedEnrollment = null;

        if (courseData.data) {
          fetchedCourse = courseData.data;
          setCourse(fetchedCourse);
          if (fetchedCourse.lessons?.length > 0) {
            setActiveLesson(fetchedCourse.lessons[0]);
          }
        }

        if (enrollmentData.data && enrollmentData.data.length > 0) {
          fetchedEnrollment = enrollmentData.data[0];

          // --- SELF-HEALING PROGRESS CALCULATION ---
          const totalLessons = fetchedCourse?.lessons?.length || 0;
          const completedCount =
            fetchedEnrollment.completed_lessons?.length || 0;
          let trueProgress = 0;

          if (totalLessons > 0) {
            trueProgress = Math.round((completedCount / totalLessons) * 100);
          }
          if (trueProgress > 100) trueProgress = 100;

          // If the database is stale (an instructor added/removed lessons), fix it silently
          if (trueProgress !== fetchedEnrollment.progress_percentage) {
            fetchedEnrollment.progress_percentage = trueProgress; // Update local state instantly

            // Fire a background sync to patch Strapi
            fetch(
              `${STRAPI_URL}/api/enrollments/${fetchedEnrollment.documentId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                  data: { progress_percentage: trueProgress },
                }),
              },
            ).catch((err) =>
              console.error("Failed to background sync progress", err),
            );
          }

          setEnrollment(fetchedEnrollment);
        }
      } catch (error) {
        console.error("Failed to load learning environment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningData();
  }, [jwt, user, courseId, STRAPI_URL]);

  // --- Mark Lesson as Complete ---
  const handleMarkComplete = async () => {
    if (!jwt || !enrollment || !course || !activeLesson) return;

    setIsUpdating(true);
    try {
      // 1. Get the current list of completed lesson IDs
      const existingCompletedIds =
        enrollment.completed_lessons?.map((l) => l.documentId) || [];

      // Stop if this lesson is already marked as complete
      if (existingCompletedIds.includes(activeLesson.documentId)) {
        setIsUpdating(false);
        return;
      }

      // 2. Create a new array including the lesson that was just finished
      const updatedCompletedIds = [
        ...existingCompletedIds,
        activeLesson.documentId,
      ];

      // 3. Calculate accurate progress percentage
      const totalLessons = course.lessons?.length || 0;
      const completedCount = updatedCompletedIds.length;
      let newProgress = 0;

      if (totalLessons > 0) {
        newProgress = Math.round((completedCount / totalLessons) * 100);
      }
      console.log(completedCount, totalLessons);
      if (newProgress > 100) newProgress = 100;

      // 4. PUT request to Strapi using explicit connect syntax
      const res = await fetch(
        `${STRAPI_URL}/api/enrollments/${enrollment.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            data: {
              progress_percentage: newProgress,
              completed_lessons: {
                connect: [activeLesson.documentId],
              },
            },
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update progress");
      }

      // 5. Update local React state to instantly show the checkmark and progress bar
      setEnrollment({
        ...enrollment,
        progress_percentage: newProgress,
        completed_lessons: [
          ...(enrollment.completed_lessons || []),
          activeLesson,
        ],
      });
    } catch (error) {
      console.error(error);
      alert("Could not save progress. Please check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Helper to check if a lesson is done ---
  const isLessonCompleted = (lessonDocId: string) => {
    return enrollment?.completed_lessons?.some(
      (l) => l.documentId === lessonDocId,
    );
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const ytRegExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(ytRegExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url; // Returns original url if not YouTube
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading curriculum...
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="p-8 text-center text-red-500">
        Course or Enrollment not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Navigation & Progress */}
      <header className="border-b bg-white p-4 flex items-center justify-between shrink-0">
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
        <div className="flex items-center space-x-4 w-64">
          <div className="text-sm font-medium">
            {enrollment.progress_percentage || 0}%
          </div>
          <Progress
            value={enrollment.progress_percentage || 0}
            className="h-2 w-full"
          />
        </div>
      </header>

      {/* Main Learning Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Content Viewer */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Conditionally render the iframe ONLY if a video_url exists */}
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
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />{" "}
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              </div>

              {/* Conditionally render the Text block ONLY if text_content exists */}
              {activeLesson.text_content && (
                <Card>
                  <CardContent className="p-6 prose max-w-none whitespace-pre-wrap text-slate-800">
                    {activeLesson.text_content}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 mt-20">
              No lessons available in this course yet.
            </div>
          )}
        </main>

        {/* Right Panel: Curriculum Sidebar */}
        <aside className="w-80 border-l bg-white overflow-y-auto shrink-0">
          <div className="p-4 font-semibold border-b bg-slate-50">
            Course Content
          </div>
          <div className="flex flex-col">
            {course.lessons?.map((lesson, index) => {
              const isActive = activeLesson?.documentId === lesson.documentId;
              const isDone = isLessonCompleted(lesson.documentId);

              return (
                <button
                  key={lesson.documentId}
                  onClick={() => setActiveLesson(lesson)}
                  className={`p-4 text-left border-b hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                    isActive
                      ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs text-slate-500">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-sm ${
                      isActive
                        ? "font-semibold text-indigo-900"
                        : "font-medium text-slate-700"
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
