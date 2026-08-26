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
import { EyeOff, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";

interface Course {
  id: number;
  documentId: string;
  title: string;
  publishedAt: string | null;
  instructor?: {
    username: string;
  };
}

export default function AdminCoursesPage() {
  const jwt = useAppSelector((state) => state.auth.jwt);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchCourses = async () => {
      if (!jwt) return;
      try {
        // Fetch courses and populate the instructor relation
        const res = await fetch(
          `${STRAPI_URL}/api/courses?populate=instructor`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          },
        );
        const data = await res.json();
        setCourses(data.data || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [jwt, STRAPI_URL]);

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`${STRAPI_URL}/api/courses/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.documentId !== documentId));
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Courses</h1>
        <p className="text-slate-500 mt-2">
          Monitor and moderate all curriculum content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      Loading courses...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      No courses found on the platform.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>
                        {course.instructor?.username || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={course.publishedAt ? "default" : "secondary"}
                        >
                          {course.publishedAt ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm">
                          <EyeOff className="h-4 w-4 mr-1" /> Hide
                        </Button>
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
