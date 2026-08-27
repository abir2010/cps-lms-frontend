"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  body: string;
  cover_image_url?: string;
  createdAt: string;
  author?: {
    username: string;
  };
}

export default function PublicBlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Explicitly filter for published posts and populate the author
        const res = await fetch(
          `${STRAPI_URL}/api/blogs?filters[status_type][$eq]=published&populate=author`,
        );
        const data = await res.json();

        if (res.ok) {
          setPosts(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [STRAPI_URL]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading latest posts...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <header className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Platform Updates & Articles
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Read the latest news, tutorials, and announcements from our
          instructors and admins.
        </p>
      </header>

      {posts.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-40 text-slate-500">
            <p>No published posts available right now. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link key={post.documentId} href={`/blog/${post.documentId}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
                {post.cover_image_url && (
                  <div className="h-48 w-full bg-slate-100 overflow-hidden shrink-0">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-700"
                    >
                      Published
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-slate-500 line-clamp-3">{post.body}</p>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t p-4 flex items-center space-x-6 text-xs text-slate-500">
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
