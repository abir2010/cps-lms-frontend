"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        className="pointer-events-none absolute -top-24 right-[-6rem] size-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20"
      >
        <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-balance text-primary-foreground/80">
          Create a free account and enroll in your first course today.
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 gap-2 rounded-full px-7 text-base"
            >
              Sign up for free <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
