"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute top-5 right-5 sm:right-8">
        <ThemeToggle />
      </div>
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-125 w-125 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--primary), transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] -z-10 h-100 w-100 rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl px-6 pt-24 pb-20 text-center sm:pt-28 sm:pb-24"
      >
        <motion.div
          variants={item}
          className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          <GraduationCap className="size-8" strokeWidth={2} />
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-7 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Platform Name
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground"
        >
          Learn new skills with courses built by instructors, track your
          progress lesson by lesson, and read the latest from our blog.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="h-12 gap-2 rounded-full px-7 text-base">
              Get started free <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="#courses">
            <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
              Browse courses
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
