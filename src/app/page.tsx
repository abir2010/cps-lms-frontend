"use client";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute top-5 right-6">
        <ThemeToggle />
      </div>

      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-125 w-125 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary), transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-24 -z-10 h-100 w-100 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--accent), transparent 65%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-xl space-y-7 text-center"
      >
        <motion.div
          variants={item}
          className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          <GraduationCap className="size-8" strokeWidth={2} />
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Platform Name
        </motion.h1>

        <motion.p
          variants={item}
          className="text-balance text-lg leading-relaxed text-muted-foreground"
        >
          Learn new skills with courses built by instructors, track your
          progress lesson by lesson, and read the latest from our blog.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link href="/login">
            <Button size="lg" className="rounded-full px-7">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="rounded-full px-7">
              Sign Up
            </Button>
          </Link>
          <Link href="/blog">
            <Button size="lg" variant="ghost" className="rounded-full px-7">
              Read the Blog
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
