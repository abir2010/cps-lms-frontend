"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../../store/store";

interface Lesson {
  id: number;
  documentId: string;
  title: string;
  type: "text" | "video";
  text_content: string | null;
  video_url: string | null;
  sequence_order: number | null;
}

interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  publishedAt: string | null;
  instructor?: { id: number };
  lessons?: Lesson[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ documentId: string }>();
  const { jwt, user } = useAppSelector((state) => state.auth);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Course details form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);

  // New lesson form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<"text" | "video">("text");
  const [lessonContent, setLessonContent] = useState("");
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!jwt || !params.documentId) return;
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/courses/${params.documentId}?populate[lessons][sort]=sequence_order:asc&populate[instructor]=true`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );
        if (!res.ok) throw new Error("Course not found.");
        const { data } = await res.json();
        setCourse(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setLessons(data.lessons || []);
      } catch (error: any) {
        setLoadError(error.message || "Failed to load course.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [jwt, params.documentId, STRAPI_URL]);

  const handleSaveCourse = async () => {
    if (!jwt || !course) return;
    setIsSavingCourse(true);
    setCourseError(null);
    try {
      const res = await fetch(
        `${STRAPI_URL}/api/courses/${course.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ data: { title, description } }),
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to save course");
      }
    } catch (error: any) {
      setCourseError(error.message || "Something went wrong.");
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!jwt || !course) return;
    if (!confirm("Delete this course and all of its lessons?")) return;
    try {
      const res = await fetch(
        `${STRAPI_URL}/api/courses/${course.documentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );
      if (res.ok) router.push("/instructor/courses");
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const handleAddLesson = async () => {
    if (!jwt || !course) return;
    setLessonError(null);

    if (lessonTitle.trim().length < 3) {
      setLessonError("Lesson title must be at least 3 characters.");
      return;
    }
    if (!lessonContent.trim()) {
      setLessonError(
        lessonType === "text"
          ? "Please add the lesson's text content."
          : "Please add a video URL.",
      );
      return;
    }

    setIsAddingLesson(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            title: lessonTitle,
            type: lessonType,
            text_content: lessonType === "text" ? lessonContent : undefined,
            video_url: lessonType === "video" ? lessonContent : undefined,
            sequence_order: lessons.length + 1,
            course: course.id,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to add lesson");
      }

      const { data: created } = await res.json();
      setLessons((prev) => [...prev, created]);
      setLessonTitle("");
      setLessonContent("");
    } catch (error: any) {
      setLessonError(error.message || "Something went wrong.");
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (documentId: string) => {
    if (!jwt) return;
    if (!confirm("Remove this lesson?")) return;
    try {
      const res = await fetch(`${STRAPI_URL}/api/lessons/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.documentId !== documentId));
      }
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    }
  };

  if (isLoading) {
    return <p className="text-slate-500">Loading course...</p>;
  }

  if (loadError || !course) {
    return (
      <Card className="bg-slate-50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-40 text-slate-500">
          <p>{loadError || "Course not found."}</p>
        </CardContent>
      </Card>
    );
  }

  const isOwner = !course.instructor || course.instructor.id === user?.id;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-slate-500 mt-2">
            Update the course details and build out its lessons.
          </p>
        </div>
        <Badge variant={course.publishedAt ? "default" : "secondary"}>
          {course.publishedAt ? "Published" : "Draft"}
        </Badge>
      </div>

      {!isOwner && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
          This course belongs to another instructor. Changes made here will
          still be saved.
        </p>
      )}

      {/* Course details */}
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              className="min-h-30"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {courseError && (
            <p className="text-sm font-medium text-destructive">
              {courseError}
            </p>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" onClick={handleDeleteCourse}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Course
            </Button>
            <Button onClick={handleSaveCourse} disabled={isSavingCourse}>
              {isSavingCourse ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {lessons.length === 0 ? (
            <p className="text-sm text-slate-500">
              No lessons yet. Add your first one below.
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {lessons.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-6">
                      {lesson.sequence_order ?? index + 1}.
                    </span>
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.type === "video" ? "Video" : "Text"} lesson
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLesson(lesson.documentId)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">Add a Lesson</h3>

            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Lesson Title</Label>
              <Input
                id="lessonTitle"
                placeholder="e.g., Getting Started with Variables"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <Select
                value={lessonType}
                onValueChange={(value) => {
                  if (value === "text" || value === "video") {
                    setLessonType(value);
                    setLessonContent("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a lesson type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {lessonType === "text" ? (
                <>
                  <Label htmlFor="lessonContent">Lesson Content</Label>
                  <Textarea
                    id="lessonContent"
                    className="min-h-30"
                    placeholder="Write the lesson content..."
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="lessonContent">Video URL</Label>
                  <Input
                    id="lessonContent"
                    placeholder="https://..."
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                  />
                </>
              )}
            </div>

            {lessonError && (
              <p className="text-sm font-medium text-destructive">
                {lessonError}
              </p>
            )}

            <div className="flex justify-end">
              <Button onClick={handleAddLesson} disabled={isAddingLesson}>
                {isAddingLesson ? "Adding..." : "Add Lesson"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
