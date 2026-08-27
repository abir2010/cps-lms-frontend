"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
      <div className="text-xl font-bold text-indigo-600">
        <Link href="/dashboard">Platform Name</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/blog"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Blog
        </Link>

        <div className="text-sm text-slate-500">
          Signed in as{" "}
          <span className="font-semibold text-slate-900">{user.username}</span>
          <span className="ml-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs">
            {user.role}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </nav>
  );
}
