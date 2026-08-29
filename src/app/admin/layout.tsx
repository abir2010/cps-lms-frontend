"use client";

import Cookies from "js-cookie";
import { GraduationCap, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove("jwt");
    Cookies.remove("role");
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/admin" },
    { name: "Manage Users", href: "/admin/users" },
    { name: "All Courses", href: "/admin/courses" },
    { name: "Blog Posts", href: "/admin/blogs" },
    { name: "Site Configuration", href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — deliberately its own dark chrome regardless of the
          site theme, a common admin-panel convention; the toggle below
          still controls the theme of the main content area. */}
      <aside className="flex w-64 flex-col bg-[oklch(0.19_0.02_264)] text-white">
        <div className="flex items-center gap-2.5 p-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="text-lg leading-tight font-bold">LMS Admin</h2>
            <p className="text-xs text-white/50">{user?.username}</p>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}>
                <span
                  className={`block rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-white/50">Theme</span>
            <ThemeToggle />
          </div>
          <Button
            variant="destructive"
            className="w-full gap-1.5"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" />
            Log Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
