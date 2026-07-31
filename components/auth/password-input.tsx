"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { FormField } from "@/components/auth/form-field";

type PasswordInputProps = Omit<
  React.ComponentProps<"input">,
  "id" | "label" | "type"
> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function PasswordInput({
  id,
  label,
  hint,
  error,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      id={id}
      label={label}
      icon={Lock}
      hint={hint}
      error={error}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visible ? "eye-off" : "eye"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      }
      {...props}
    />
  );
}
