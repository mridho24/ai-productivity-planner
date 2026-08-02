"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Lock, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { FormField } from "@/components/auth/form-field";
import {
  PASSWORD_REQUIREMENTS,
  STRENGTH_COLORS,
  STRENGTH_LABEL,
  passwordScore,
} from "@/lib/password-policy";

type PasswordInputProps = Omit<
  React.ComponentProps<"input">,
  "id" | "label" | "type" | "value"
> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  strength?: boolean;
};

export function PasswordInput({
  id,
  label,
  hint,
  error,
  strength = false,
  onChange,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  const score = passwordScore(value);

  return (
    <div className="grid gap-1.5">
      <FormField
        id={id}
        label={label}
        icon={Lock}
        hint={hint}
        error={error}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onChange?.(event);
        }}
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

      <AnimatePresence>
        {strength && value.length > 0 ? (
          <motion.div
            key="password-strength"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-2.5 overflow-hidden"
          >
            <div
              role="progressbar"
              aria-label="Kekuatan password"
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={score}
              className="h-1.5 w-full overflow-hidden rounded-full bg-border"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${STRENGTH_COLORS[score]}`}
                style={{ width: `${(score / 5) * 100}%` }}
              />
            </div>

            <p className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="font-medium">Harus berisi:</span>
              <span className="shrink-0 font-mono text-[11px]">
                {
                  STRENGTH_LABEL[
                    Math.min(score, 4) as keyof typeof STRENGTH_LABEL
                  ]
                }
              </span>
            </p>

            <ul className="grid gap-1.5" aria-label="Syarat password">
              {PASSWORD_REQUIREMENTS.map((req, index) => {
                const met = req.regex.test(value);
                return (
                  <li key={index} className="flex items-center gap-2">
                    {met ? (
                      <Check className="size-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="size-3.5 shrink-0 text-muted-foreground/60" />
                    )}
                    <span
                      className={`text-xs ${
                        met ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {req.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
