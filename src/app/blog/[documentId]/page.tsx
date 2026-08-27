"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, User } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useGetBlogPostQuery } from "../../../store/api/blogApi";

export default function SingleBlogPost() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  const { data: post, isLoading } = useGetBlogPostQuery(params.documentId);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading article...</div>
    );
  }

  if (!post || post.status_type === "draft") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-xl font-semibold text-slate-700">
          Article not found
        </div>
        <p className="text-slate-500">
          This post may have been removed or is not yet published.
        </p>
        <Button variant="outline" onClick={() => router.push("/blog")}>
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* Navigation & Metadata */}
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/blog")}
          className="-ml-4 text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>

        <div className="space-y-4">
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
            Published
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-slate-500 border-t border-b py-4 mt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="font-medium text-slate-700">
                {post.author?.username || "Platform Admin"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-md relative">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Article Body */}
      <div className="prose prose-slate prose-lg max-w-none whitespace-pre-wrap leading-relaxed text-slate-800">
        {post.body}
      </div>
    </article>
  );
}
