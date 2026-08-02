"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { resetPassword } from "@/lib/actions/reset-password";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

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
      <input type="hidden" name="token" value={token} />

      <motion.div variants={fadeUp}>
        <PasswordInput
          id="password"
          name="password"
          label="Password baru"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          strength
          required
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi password"
          autoComplete="new-password"
          placeholder="Ulangi password baru"
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
              Menyimpan password…
            </>
          ) : (
            "Simpan password baru"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
