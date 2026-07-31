"use client";

import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = React.ComponentProps<"input"> & {
  id: string;
  label: string;
  icon: LucideIcon;
  trailing?: React.ReactNode;
  hint?: string;
  error?: string;
};

export function FormField({
  id,
  label,
  icon: Icon,
  trailing,
  hint,
  error,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[13px]">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-11 rounded-xl py-1 pr-3.5 pl-10 text-[15px]",
            trailing && "pr-11",
            className
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        ) : null}
      </div>
      <AnimatePresence>
        {error ? (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs font-medium text-destructive"
          >
            <CircleAlert className="size-3.5 shrink-0" />
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
