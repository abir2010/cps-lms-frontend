"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/shared/loader";
import { useGetCoursesQuery } from "@/src/store/api/coursesApi";

export function FeaturedCourses() {
  const { data: courses, isLoading } = useGetCoursesQuery();
  const published = (courses ?? []).filter((c) => c.publishedAt).slice(0, 6);

  return (
    <section id="courses" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="max-w-lg">
          <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Explore
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Courses you can start today
          </h2>
          <p className="mt-3 text-muted-foreground">
            A growing catalog, built and taught by real instructors on the
            platform.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader label="Loading courses..." />
          </div>
        ) : published.length === 0 ? (
          <Card className="mt-10 border-dashed bg-muted/40">
            <CardContent className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <p>No courses published yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              >
                <Card className="flex h-full flex-col">
                  <CardHeader>
                    <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BookOpen className="size-4.5" strokeWidth={2} />
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {course.description || "No description provided."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/courses/${course.documentId}`} className="w-full">
                      <Button variant="outline" className="w-full gap-1.5">
                        View course <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
