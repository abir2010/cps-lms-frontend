"use client";

import { CourseForm } from "@/components/courses/CourseForm";

export default function CreateAdminCoursePage() {
  return (
    <CourseForm
      editPathFor={(documentId) => `/admin/courses/${documentId}/edit`}
      listPath="/admin/courses"
    />
  );
}
