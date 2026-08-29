"use client";

import { motion } from "framer-motion";
import { BookOpen, ClipboardCheck, Search, UserPlus } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up as a student in seconds — no payment required to get started.",
  },
  {
    icon: Search,
    title: "Find a course",
    body: "Browse the catalog and enroll in whatever you're curious about.",
  },
  {
    icon: BookOpen,
    title: "Learn lesson by lesson",
    body: "Work through text and video lessons at your own pace, whenever suits you.",
  },
  {
    icon: ClipboardCheck,
    title: "Prove what you learned",
    body: "Take the course quiz and watch your progress fill in as you go.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
        <div className="max-w-lg">
          <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            How it works
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Four steps from sign-up to finished course
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl border border-border bg-card p-5"
            >
              <span className="text-xs font-semibold text-muted-foreground/70">
                0{i + 1}
              </span>
              <div className="mt-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="size-5" strokeWidth={2} />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
