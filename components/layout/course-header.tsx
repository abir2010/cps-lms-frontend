"use client";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { getHomeForRole } from "@/src/lib/roleRoutes";
import { useAppSelector } from "@/src/store/store";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function CourseHeader() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5 sm:px-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold text-foreground"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-4.5" strokeWidth={2.25} />
        </span>
        Explora Learn
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {isAuthenticated && user ? (
          <Link href={getHomeForRole(user.role)}>
            <Button variant="outline" size="sm">
              My Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
