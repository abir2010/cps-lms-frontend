"use client";

import { CourseForm } from "@/components/courses/CourseForm";

export default function CreateContentCoursePage() {
  return (
    <CourseForm
      editPathFor={(documentId) => `/content/courses/${documentId}/edit`}
      listPath="/content/courses"
    />
  );
}
