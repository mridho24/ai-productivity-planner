import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar — Planbreak",
};

export default function RegisterPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Mulai dari nol
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Buat akun baru
        </h1>
        <p className="text-sm text-muted-foreground">
          Mulai pecah rencana besar kamu jadi langkah kecil.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
