"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleAlert, Loader2, Mail, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <motion.form
      action={formAction}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
      }}
      className="grid gap-5"
    >
      <motion.div variants={fadeUp}>
        <FormField
          id="name"
          name="name"
          label="Nama"
          icon={User}
          type="text"
          autoComplete="name"
          placeholder="Nama kamu"
          required
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <FormField
          id="email"
          name="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="kamu@email.com"
          required
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Minimal 6 karakter"
          hint="Gunakan minimal 6 karakter untuk keamanan."
          required
        />
      </motion.div>

      <AnimatePresence>
        {state?.error ? (
          <motion.div
            key="form-error"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive"
          >
            <CircleAlert className="size-4 shrink-0" />
            {state.error}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div variants={fadeUp}>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-xl text-[15px] shadow-[0_8px_20px_-10px_rgb(15_118_110/0.55)] transition-all hover:translate-y-[-1px] hover:bg-primary/90 hover:shadow-[0_12px_24px_-10px_rgb(15_118_110/0.6)] active:translate-y-0 dark:shadow-[0_8px_20px_-10px_rgb(45_212_191/0.3)] dark:hover:shadow-[0_12px_24px_-10px_rgb(45_212_191/0.35)]"
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Membuat akun…
            </>
          ) : (
            "Buat akun"
          )}
        </Button>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="text-center text-sm text-muted-foreground"
      >
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Masuk
        </Link>
      </motion.p>
    </motion.form>
  );
}
