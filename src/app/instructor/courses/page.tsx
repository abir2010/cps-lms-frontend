"use client";

import { CourseManagerList } from "@/components/courses/CourseManagerList";

export default function InstructorCoursesPage() {
  return (
    <CourseManagerList
      scope="own"
      basePath="/instructor/courses"
      title="My Courses"
      description="Manage your curriculum and content modules."
    />
  );
}
