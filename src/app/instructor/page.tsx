"use client";

import { CategoryDonut } from "@/components/dashboard/category-donut";
import { StatCard } from "@/components/dashboard/stat-card";
import { Loader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, FileEdit } from "lucide-react";
import Link from "next/link";
import { useGetCoursesQuery } from "../../store/api/coursesApi";
import { useAppSelector } from "../../store/store";

export default function InstructorHomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: courses, isLoading } = useGetCoursesQuery(
    user ? { instructorId: user.id } : undefined,
  );

  const publishedCount = courses?.filter((c) => c.publishedAt).length ?? 0;
  const totalCount = courses?.length ?? 0;
  const draftCount = totalCount - publishedCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your courses and track their status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total courses"
          value={isLoading ? "…" : String(totalCount)}
          index={0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Published"
          value={isLoading ? "…" : String(publishedCount)}
          index={1}
        />
        <StatCard
          icon={FileEdit}
          label="Drafts"
          value={isLoading ? "…" : String(draftCount)}
          index={2}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader label="Loading your courses..." />
        </div>
      ) : (
        totalCount > 0 && (
          <CategoryDonut
            title="Course status"
            subtitle={`${totalCount} course${totalCount === 1 ? "" : "s"} total`}
            data={[
              { name: "Published", value: publishedCount },
              { name: "Draft", value: draftCount },
            ]}
          />
        )
      )}

      <Link href="/instructor/courses">
        <Button>Go to My Courses</Button>
      </Link>
    </div>
  );
}
