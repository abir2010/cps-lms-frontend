"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ChevronLeft, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetPublishedBlogsQuery } from "../../store/api/blogApi";

export default function PublicBlogList() {
  const { data: posts, isLoading } = useGetPublishedBlogsQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading latest posts...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/dashboard")}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <header className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Platform Updates & Articles
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Read the latest news, tutorials, and announcements from our
          instructors and admins.
        </p>
      </header>

      {!posts || posts.length === 0 ? (
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No published posts available right now. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link key={post.documentId} href={`/blog/${post.documentId}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
                {post.cover_image_url && (
                  <div className="h-48 w-full bg-muted overflow-hidden shrink-0 relative">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      Published
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3">
                    {post.body}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/40 border-t p-4 flex items-center space-x-6 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{post.author?.username || "Admin"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
