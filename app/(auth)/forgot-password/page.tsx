import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa password — Planbreak",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Reset password
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Lupa password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Tenang, kami bantu kamu masuk kembali.
        </p>
      </div>

      <AuthCard>
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
}
