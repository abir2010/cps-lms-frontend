"use client";

import { CourseEditForm } from "@/components/courses/CourseEditForm";
import { useParams } from "next/navigation";

export default function EditContentCoursePage() {
  const params = useParams<{ documentId: string }>();

  return (
    <CourseEditForm documentId={params.documentId} listPath="/content/courses" />
  );
}
