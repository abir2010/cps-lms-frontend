"use client";

import { CategoryDonut } from "@/components/dashboard/category-donut";
import { StatCard } from "@/components/dashboard/stat-card";
import { Loader } from "@/components/shared/loader";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileEdit,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { useGetCoursesQuery } from "../../store/api/coursesApi";
import { useAppSelector } from "../../store/store";

const quickLinks = [
  {
    href: "/instructor/courses",
    icon: BookOpen,
    title: "My Courses",
    description: "Create, edit, and publish your curriculum.",
  },
  {
    href: "/instructor/students",
    icon: BarChart3,
    title: "Course Completion by Student",
    description: "See how far every enrolled student has progressed.",
  },
  {
    href: "/instructor/quiz-results",
    icon: ListChecks,
    title: "Quiz Results",
    description: "Review attempts and accuracy across your quizzes.",
  },
];

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

      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Quick links
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <link.icon className="size-5" strokeWidth={2} />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {link.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
