"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = { sm: 16, md: 24, lg: 40, xl: 64 } as const;

export function Loader({
  size = "md",
  label,
  className,
}: {
  size?: keyof typeof sizes;
  label?: string;
  className?: string;
}) {
  const px = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2 text-primary", className)}>
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        className="inline-flex"
      >
        <GraduationCap width={px} height={px} strokeWidth={2} />
      </motion.span>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </span>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-background"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-primary"
      >
        <Loader size="xl" />
      </motion.div>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
    </motion.div>
  );
}
