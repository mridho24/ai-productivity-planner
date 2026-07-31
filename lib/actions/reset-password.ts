"use server";

import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { passwordResetUrl, sendPasswordResetEmail } from "@/lib/email";

const emailSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

const resetSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const TOKEN_TTL_MINUTES = 30;

export type ResetFormState =
  | { error?: string; success?: boolean }
  | undefined;

export async function requestPasswordReset(
  _prevState: ResetFormState,
  formData: FormData
) {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    const resetUrl = passwordResetUrl(token);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      console.error("Gagal mengirim email reset:", error);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] Tautan reset: ${resetUrl}`);
      }
    }
  }

  return { success: true };
}

export async function resetPassword(
  _prevState: ResetFormState,
  formData: FormData
) {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  if (formData.get("confirmPassword") !== parsed.data.password) {
    return { error: "Konfirmasi password tidak sama" };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: true },
  });

  const isValid =
    resetToken &&
    resetToken.usedAt === null &&
    resetToken.expiresAt > new Date();

  if (!isValid || !resetToken) {
    return { error: "Tautan reset tidak valid atau sudah kedaluwarsa" };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=success");
}
