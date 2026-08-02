export const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "Minimal 8 karakter" },
  { regex: /[0-9]/, text: "Minimal 1 angka" },
  { regex: /[a-z]/, text: "Minimal 1 huruf kecil" },
  { regex: /[A-Z]/, text: "Minimal 1 huruf besar" },
  { regex: /[!-\/:-@[-`{-~]/, text: "Minimal 1 karakter khusus" },
] as const;

export type PasswordRequirement = (typeof PASSWORD_REQUIREMENTS)[number];

export type PasswordScore = 0 | 1 | 2 | 3 | 4 | 5;

export function passwordScore(password: string): PasswordScore {
  return PASSWORD_REQUIREMENTS.filter((req) =>
    req.regex.test(password)
  ).length as PasswordScore;
}

export const STRENGTH_COLORS: Record<PasswordScore, string> = {
  0: "bg-border",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-amber-400",
  4: "bg-emerald-500",
  5: "bg-emerald-500",
};

export const STRENGTH_LABEL: Record<Exclude<PasswordScore, 5>, string> = {
  0: "Masukkan password",
  1: "Password lemah",
  2: "Password sedang",
  3: "Password kuat",
  4: "Password sangat kuat",
};
