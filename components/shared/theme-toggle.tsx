"use client";

import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle day / night theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-14 shrink-0 items-center rounded-full border border-border bg-secondary px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <Sun className="absolute left-1.5 size-3 text-accent-foreground/50" strokeWidth={2} />
      <Moon className="absolute right-1.5 size-3 text-foreground/40" strokeWidth={2} />

      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm",
          isDark ? "ml-auto" : "ml-0"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -60, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 60, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="size-3" strokeWidth={2.25} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 60, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -60, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="size-3" strokeWidth={2.25} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
