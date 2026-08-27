"use client";

import { CourseForm } from "@/components/courses/CourseForm";

export default function CreateCoursePage() {
  return (
    <CourseForm
      editPathFor={(documentId) => `/instructor/courses/${documentId}/edit`}
      listPath="/instructor/courses"
    />
  );
}
