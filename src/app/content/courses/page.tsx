"use client";

import { CourseManagerList } from "@/components/courses/CourseManagerList";

export default function ContentCoursesPage() {
  return (
    <CourseManagerList
      scope="all"
      basePath="/content/courses"
      title="All Courses"
      description="Create and manage every course on the platform."
    />
  );
}
