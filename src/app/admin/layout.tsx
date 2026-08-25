"use client";

import { logout } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold">LMS Admin</h2>
          <p className="text-sm text-slate-400 mt-1">{user?.username}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}>
                <span
                  className={`block px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
