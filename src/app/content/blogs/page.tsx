"use client";

import { BlogManagerList } from "@/components/blog/BlogManagerList";

export default function ContentBlogsPage() {
  // The backend enforces "own posts only" for a Content Manager's
  // update/delete calls, so this list can safely show every post — a
  // non-owned post's Edit/Delete controls will just 403 if attempted, but we
  // keep the UI aligned with that by only offering delete on owned posts
  // (canDeleteAny is Admin-only).
  return <BlogManagerList basePath="/content/blogs" canDeleteAny={false} />;
}
