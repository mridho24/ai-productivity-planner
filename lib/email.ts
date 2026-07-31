import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export function passwordResetUrl(token: string) {
  return `${appUrl()}/reset-password?token=${token}`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD belum dikonfigurasi");
  }

  await transporter.sendMail({
    from: `Planbreak <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset password Planbreak",
    text: `Hai,\n\nKami menerima permintaan reset password untuk akun kamu.\n\nBuka tautan berikut dalam 30 menit untuk membuat password baru:\n${resetUrl}\n\nJika kamu tidak meminta ini, abaikan email ini.\n\n— Tim Planbreak`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: #0f766e; color: #f0fdfa; font-weight: bold;">P</span>
          <strong style="font-size: 18px;">Planbreak</strong>
        </div>
        <h2 style="font-size: 18px; margin: 0 0 8px;">Reset password</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Kami menerima permintaan reset password untuk akun kamu. Tautan ini berlaku 30 menit.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 20px; background: #0f766e; color: #ffffff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">Buat password baru</a>
        <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">Jika tombol tidak berfungsi, salin tautan ini:<br/><span style="word-break: break-all;">${resetUrl}</span></p>
        <p style="color: #6b7280; font-size: 13px;">Jika kamu tidak meminta ini, abaikan email ini.</p>
        <p style="color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px;">— Tim Planbreak</p>
      </div>
    `,
  });
}
