"use client";

import { motion } from "framer-motion";
import { useGetCoursesQuery } from "@/src/store/api/coursesApi";

/**
 * The only number a logged-out visitor's request can actually see is the
 * course count — Strapi strips the `instructor` relation (and anything
 * else) from a Public-role response for content types Public can't read,
 * by design (that's what keeps student/instructor accounts from being
 * enumerable pre-login). So this deliberately doesn't claim an instructor
 * or student count it has no honest number for.
 */
export function StatsBar() {
  const { data: courses } = useGetCoursesQuery();
  const courseCount = courses?.length ?? 0;

  const stats = [
    { value: `${courseCount}+`, label: "courses available" },
    { value: "Self-paced", label: "learn on your schedule" },
    { value: "Auto-graded", label: "quizzes with instant results" },
  ];

  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-3 sm:py-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
