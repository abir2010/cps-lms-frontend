"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAppSelector } from "../../store/store";
import { useGetCoursesQuery } from "../../store/api/coursesApi";
import { useGetAllBlogsQuery } from "../../store/api/blogApi";

export default function ContentManagerHomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: courses, isLoading: coursesLoading } = useGetCoursesQuery();
  const { data: posts, isLoading: postsLoading } = useGetAllBlogsQuery();

  const publishedPosts = posts?.filter((p) => p.status_type === "published").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username}
        </h1>
        <p className="text-slate-500 mt-2">
          Manage the platform&apos;s courses, lessons, and blog posts.
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
            {coursesLoading ? "…" : courses?.length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {postsLoading ? "…" : posts?.length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Published Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {postsLoading ? "…" : publishedPosts}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/content/courses">
          <Button>Manage Courses</Button>
        </Link>
        <Link href="/content/blogs">
          <Button variant="outline">Manage Blog Posts</Button>
        </Link>
      </div>
    </div>
  );
}
