"use client";

import { CategoryDonut } from "@/components/dashboard/category-donut";
import { StatCard } from "@/components/dashboard/stat-card";
import { Loader } from "@/components/shared/loader";
import { Card, CardContent } from "@/components/ui/card";
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the platform administration console.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total users"
          value={usersLoading ? "…" : String(users?.length ?? 0)}
          index={0}
        />
        <StatCard
          icon={BookOpen}
          label="Total courses"
          value={coursesLoading ? "…" : String(courseCount ?? 0)}
          index={1}
        />
        <StatCard
          icon={GraduationCap}
          label="Active enrollments"
          value={enrollmentsLoading ? "…" : String(enrollmentCount ?? 0)}
          index={2}
        />
      </div>

      {usersLoading ? (
        <Card>
          <CardContent className="flex justify-center p-10">
            <Loader label="Loading user data..." />
          </CardContent>
        </Card>
      ) : (
        <CategoryDonut
          title="Users by role"
          subtitle={`${users?.length ?? 0} total accounts`}
          data={Object.entries(usersByRole).map(([name, value]) => ({
            name,
            value,
          }))}
        />
      )}
    </div>
  );
}
