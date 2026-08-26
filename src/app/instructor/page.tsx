"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/store";

interface Course {
  id: number;
  documentId: string;
  title: string;
  publishedAt: string | null;
}

export default function InstructorHomePage() {
  const { jwt, user } = useAppSelector((state) => state.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!jwt || !user) return;
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/courses?filters[instructor][id][$eq]=${user.id}`,
          { headers: { Authorization: `Bearer ${jwt}` } },
        );
        const data = await res.json();
        setCourses(data.data || []);
      } catch (error) {
        console.error("Failed to fetch instructor courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyCourses();
  }, [jwt, user, STRAPI_URL]);

  const publishedCount = courses.filter((c) => c.publishedAt).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your courses and track their status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "…" : courses.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "…" : publishedCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? "…" : courses.length - publishedCount}
          </CardContent>
        </Card>
      </div>

      <Link href="/instructor/courses">
        <Button>Go to My Courses</Button>
      </Link>
    </div>
  );
}
