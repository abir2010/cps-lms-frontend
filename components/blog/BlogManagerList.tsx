"use client";

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
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/src/store/store";
import {
  useDeleteBlogMutation,
  useGetAllBlogsQuery,
} from "@/src/store/api/blogApi";

interface BlogManagerListProps {
  basePath: string;
  canDeleteAny?: boolean;
}

export function BlogManagerList({
  basePath,
  canDeleteAny = false,
}: BlogManagerListProps) {
  const user = useAppSelector((state) => state.auth.user);
  const { data: posts, isLoading } = useGetAllBlogsQuery();
  const [deleteBlog] = useDeleteBlogMutation();

  const handleDelete = async (documentId: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteBlog(documentId).unwrap();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-slate-500 mt-2">
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
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Loading posts...
                    </TableCell>
                  </TableRow>
                ) : !posts || posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No posts yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => {
                    const isOwn = post.author?.id === user?.id;
                    const canDelete = canDeleteAny || isOwn;
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author?.username || "Unknown"}</TableCell>
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
                              onClick={() => handleDelete(post.documentId)}
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
    </div>
  );
}
