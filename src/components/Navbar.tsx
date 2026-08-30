"use client";

import Cookies from "js-cookie";
import { GraduationCap, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { getHomeForRole } from "../lib/roleRoutes";
import { logout } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove("jwt");
    Cookies.remove("role");
    router.push("/login");
  };

  if (!isAuthenticated || !user) return null;

  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5 sm:px-8">
      <Link
        href={getHomeForRole(user.role)}
        className="flex items-center gap-2 text-lg font-bold text-foreground"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-4.5" strokeWidth={2.25} />
        </span>
        Explora Learn
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/blog"
          className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
        >
          Blog
        </Link>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <span className="font-semibold text-foreground">{user.username}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {user.role}
          </span>
        </div>

        <ThemeToggle />

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </Button>
      </div>
    </nav>
  );
}
