import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Buat password baru — Planbreak",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const resetToken = token
    ? await prisma.passwordResetToken.findUnique({ where: { token } })
    : null;

  const isValid =
    resetToken &&
    resetToken.usedAt === null &&
    resetToken.expiresAt > new Date();

  if (!isValid || !token) {
    return (
      <AuthCard>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Tautan tidak valid
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tautan reset password ini tidak valid, sudah digunakan, atau
              sudah kedaluwarsa. Minta tautan baru untuk melanjutkan.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            Minta tautan baru
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Reset password
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Buat password baru
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih password baru yang mudah kamu ingat.
        </p>
      </div>

      <AuthCard>
        <ResetPasswordForm token={token} />
      </AuthCard>
    </div>
  );
}
