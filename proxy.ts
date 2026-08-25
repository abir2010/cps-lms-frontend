import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('jwt')?.value;
  const role = request.cookies.get('role')?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isContentRoute = pathname.startsWith('/content');
  const isInstructorRoute = pathname.startsWith('/instructor');
  const isStudentRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/courses');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthRoute && token) {
    if (role === 'Admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'Instructor') return NextResponse.redirect(new URL('/instructor', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && (isAdminRoute || isContentRoute || isInstructorRoute || isStudentRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && role) {
    // access admin route only for admin
    if (isAdminRoute && role !== 'Admin') return NextResponse.redirect(new URL('/dashboard', request.url));

    // access content route only for content manager and admin
    if (isContentRoute && role !== 'Content Manager' && role !== 'Admin') return NextResponse.redirect(new URL('/dashboard', request.url));
    
    // access instructor route only for instructor and admin
    if (isInstructorRoute && role !== 'Instructor' && role !== 'Admin') return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};