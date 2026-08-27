"use client";

import { BlogManagerList } from "@/components/blog/BlogManagerList";

export default function AdminBlogsPage() {
  return <BlogManagerList basePath="/admin/blogs" canDeleteAny />;
}
