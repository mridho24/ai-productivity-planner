import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — Planbreak",
};

export default function LoginPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Selamat datang kembali
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Masuk ke akun kamu
        </h1>
        <p className="text-sm text-muted-foreground">
          Lanjutkan dari tempat terakhir rencana kamu berhenti.
        </p>
      </div>

      <AuthCard>
        <LoginForm />
      </AuthCard>
    </div>
  );
}
