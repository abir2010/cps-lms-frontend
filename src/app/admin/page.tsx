"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "../../store/store";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const jwt = useAppSelector((state) => state.auth.jwt);
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    enrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      if (!jwt) return;

      try {
        const headers = { Authorization: `Bearer ${jwt}` };
        const STRAPI_URL =
          process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

        // Fetch counts from Strapi using the built-in pagination meta data
        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          fetch(`${STRAPI_URL}/api/users`, { headers }),
          fetch(`${STRAPI_URL}/api/courses?pagination[withCount]=true`, {
            headers,
          }),
          fetch(`${STRAPI_URL}/api/enrollments?pagination[withCount]=true`, {
            headers,
          }),
        ]);

        const users = await usersRes.json();
        const courses = await coursesRes.json();
        const enrollments = await enrollmentsRes.json();

        setStats({
          users: users.length || 0,
          courses: courses.meta?.pagination?.total || 0,
          enrollments: enrollments.meta?.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlatformStats();
  }, [jwt]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-2">
          Welcome to the platform administration console.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.users}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.courses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Active Enrollments
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.enrollments}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
