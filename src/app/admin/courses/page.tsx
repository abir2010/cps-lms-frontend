"use client";

import { CourseManagerList } from "@/components/courses/CourseManagerList";

export default function AdminCoursesPage() {
  return (
    <CourseManagerList
      scope="all"
      basePath="/admin/courses"
      title="Platform Courses"
      description="Monitor and moderate all curriculum content."
    />
  );
}
