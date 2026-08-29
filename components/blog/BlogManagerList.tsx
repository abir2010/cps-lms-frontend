"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Loader } from "@/components/shared/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteBlogMutation,
  useGetAllBlogsQuery,
} from "@/src/store/api/blogApi";
import { useAppSelector } from "@/src/store/store";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BlogManagerListProps {
  /** Route prefix for "new" / "edit" links, e.g. "/content/blogs". */
  basePath: string;
  /** True for Admin, who can delete anyone's post (the backend enforces
   * this regardless — this only affects whether the button is shown). */
  canDeleteAny?: boolean;
}

export function BlogManagerList({
  basePath,
  canDeleteAny = false,
}: BlogManagerListProps) {
  const user = useAppSelector((state) => state.auth.user);
  const { data: posts, isLoading } = useGetAllBlogsQuery();
  const [deleteBlog] = useDeleteBlogMutation();
  const [pendingDelete, setPendingDelete] = useState<{
    documentId: string;
    title: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteBlog(pendingDelete.documentId).unwrap();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Blog Posts
          </h1>
          <p className="mt-2 text-muted-foreground">
            Write, publish, and manage articles for the platform.
          </p>
        </div>
        <Link href={`${basePath}/new`}>
          <Button>Write New Post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      <div className="flex justify-center">
                        <Loader size="sm" label="Loading posts..." />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !posts || posts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No posts yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => {
                    const isOwn = post.author?.id === user?.id;
                    const canDelete = canDeleteAny || isOwn;
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          {post.title}
                        </TableCell>
                        <TableCell>
                          {post.author?.username || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.status_type === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {post.status_type === "published"
                              ? "Published"
                              : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`${basePath}/${post.documentId}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          {canDelete && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setPendingDelete({
                                  documentId: post.documentId,
                                  title: post.title,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete ? `Delete "${pendingDelete.title}"?` : ""}
        description="This permanently removes the post. This can't be undone."
        confirmLabel="Delete post"
        tone="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
