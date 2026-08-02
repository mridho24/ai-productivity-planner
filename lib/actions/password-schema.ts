import { z } from "zod";

import { PASSWORD_REQUIREMENTS } from "@/lib/password-policy";

export const passwordSchema = z
  .string()
  .refine(
    (value) => PASSWORD_REQUIREMENTS.every((req) => req.regex.test(value)),
    {
      message:
        "Password harus memenuhi semua syarat: minimal 8 karakter, angka, huruf besar/kecil, dan karakter khusus",
    }
  );
