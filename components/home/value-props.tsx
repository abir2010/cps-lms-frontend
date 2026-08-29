"use client";

import { motion } from "framer-motion";
import { Clock, LineChart, MessagesSquare, ShieldCheck } from "lucide-react";

const props = [
  {
    icon: Clock,
    title: "Learn at your own pace",
    body: "No deadlines or cohorts — pause a course for a week and pick it back up exactly where you left off.",
  },
  {
    icon: MessagesSquare,
    title: "Instructor-built content",
    body: "Every course is written by the person teaching it, not repackaged from somewhere else.",
  },
  {
    icon: LineChart,
    title: "Progress you can see",
    body: "Lesson-by-lesson completion tracking, so you always know exactly where you stand.",
  },
  {
    icon: ShieldCheck,
    title: "Quizzes that actually check",
    body: "Auto-graded checkpoints confirm what stuck — no self-reported completion.",
  },
];

export function ValueProps() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="max-w-lg">
          <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Why this platform
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for actually finishing what you start
          </h2>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {props.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-card p-7"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <prop.icon className="size-5" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-semibold text-foreground">{prop.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {prop.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
