import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getHomeForRole } from "./lib/roleRoutes";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("jwt")?.value;
  const role = request.cookies.get("role")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isContentRoute = pathname.startsWith("/content");
  const isInstructorRoute = pathname.startsWith("/instructor");
  const isStudentRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/courses");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  if (
    !token &&
    (isAdminRoute || isContentRoute || isInstructorRoute || isStudentRoute)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && role) {
    const isGatedRoute =
      isAdminRoute || isContentRoute || isInstructorRoute || isStudentRoute;

    const isAllowed =
      role === "Admin" ||
      !isGatedRoute ||
      (isContentRoute && role === "Content Manager") ||
      (isInstructorRoute && role === "Instructor") ||
      (isStudentRoute && role === "Student");

    if (!isAllowed) {
      return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
