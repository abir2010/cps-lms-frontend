"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/src/store/store";
import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/src/store/api/coursesApi";

interface CourseManagerListProps {
  /** "own" scopes the list to the logged-in Instructor's courses; "all"
   * shows every course on the platform (Content Manager / Admin). */
  scope: "own" | "all";
  /** Route prefix for "create" / "edit" links, e.g. "/instructor/courses". */
  basePath: string;
  title: string;
  description: string;
}

export function CourseManagerList({
  scope,
  basePath,
  title,
  description,
}: CourseManagerListProps) {
  const user = useAppSelector((state) => state.auth.user);
  const { data: courses, isLoading } = useGetCoursesQuery(
    scope === "own" && user ? { instructorId: user.id } : undefined,
  );
  const [deleteCourse] = useDeleteCourseMutation();

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    await deleteCourse(documentId).unwrap();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-2">{description}</p>
        </div>
        <Link href={`${basePath}/new`}>
          <Button>Create New Course</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  {scope === "all" && <TableHead>Instructor</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={scope === "all" ? 4 : 3}
                      className="text-center py-8 text-slate-500"
                    >
                      Loading courses...
                    </TableCell>
                  </TableRow>
                ) : !courses || courses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={scope === "all" ? 4 : 3}
                      className="text-center py-8 text-slate-500"
                    >
                      {scope === "own"
                        ? "You haven't created any courses yet."
                        : "No courses found on the platform."}
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      {scope === "all" && (
                        <TableCell>
                          {course.instructor?.username || "Unassigned"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge
                          variant={course.publishedAt ? "default" : "secondary"}
                        >
                          {course.publishedAt ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`${basePath}/${course.documentId}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(course.documentId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
