"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className={cn(
        "relative rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgb(16_24_40/0.04),0_16px_40px_-16px_rgb(16_24_40/0.16)] sm:p-8 dark:shadow-[0_1px_2px_rgb(0_0_0/0.5),0_20px_48px_-20px_rgb(0_0_0/0.7)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      {children}
    </motion.div>
  );
}
