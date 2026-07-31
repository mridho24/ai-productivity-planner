import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — Planbreak",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

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

      {reset === "success" ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          Password berhasil diubah. Silakan masuk dengan password baru.
        </div>
      ) : null}

      <AuthCard>
        <LoginForm />
      </AuthCard>
    </div>
  );
}
