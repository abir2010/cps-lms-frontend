"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { useGetCourseCountQuery } from "../../store/api/coursesApi";
import { useGetEnrollmentCountQuery } from "../../store/api/enrollmentsApi";
import { useGetUsersQuery } from "../../store/api/usersApi";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();
  const { data: courseCount, isLoading: coursesLoading } =
    useGetCourseCountQuery();
  const { data: enrollmentCount, isLoading: enrollmentsLoading } =
    useGetEnrollmentCountQuery();

  const usersByRole = (users ?? []).reduce<Record<string, number>>(
    (acc, user) => {
      const roleName = user.role?.name ?? "Unassigned";
      acc[roleName] = (acc[roleName] ?? 0) + 1;
      return acc;
    },
    {},
  );

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
              {usersLoading ? "..." : (users?.length ?? 0)}
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
              {coursesLoading ? "..." : (courseCount ?? 0)}
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
              {enrollmentsLoading ? "..." : (enrollmentCount ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">
            Users by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(usersByRole).map(([roleName, count]) => (
                <div key={roleName}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-slate-500">{roleName}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
