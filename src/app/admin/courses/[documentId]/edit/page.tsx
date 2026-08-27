"use client";

import { CourseEditForm } from "@/components/courses/CourseEditForm";
import { useParams } from "next/navigation";

export default function EditAdminCoursePage() {
  const params = useParams<{ documentId: string }>();

  return (
    <CourseEditForm documentId={params.documentId} listPath="/admin/courses" />
  );
}
