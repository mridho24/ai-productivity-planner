import { GoogleGenAI, Type, type Schema } from "@google/genai";

const GEMINI_MODEL = "gemini-flash-latest";

export class AiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export type AiSubtask = {
  title: string;
  estimatedMinutes: number;
};

export type WeeklyInsight = {
  summary: string;
  highlights: string[];
  suggestions: string[];
};

export type WeeklyStats = {
  periodStart: string;
  periodEnd: string;
  tasksCreated: number;
  tasksCompleted: number;
  completionRate: number;
  overdueCount: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
};

const SUBTASK_SCHEMA: Schema = {
  type: Type.ARRAY,
  description: "Daftar sub-task hasil pemecahan tugas utama.",
  items: {
    type: Type.OBJECT,
    description: "Satu sub-task dengan judul dan estimasi pengerjaan.",
    properties: {
      title: {
        type: Type.STRING,
        description: "Judul singkat sub-task, bahasa Indonesia, maksimal 160 karakter.",
      },
      estimatedMinutes: {
        type: Type.INTEGER,
        description: "Estimasi pengerjaan dalam menit (minimal 5, maksimal 480).",
      },
    },
    required: ["title", "estimatedMinutes"],
  },
};

const INSIGHT_SCHEMA: Schema = {
  type: Type.OBJECT,
  description: "Ringkasan insight mingguan terstruktur.",
  properties: {
    summary: {
      type: Type.STRING,
      description: "Paragraf singkat ringkasan produktivitas pekan ini.",
    },
    highlights: {
      type: Type.ARRAY,
      description: "Poin pencapaian penting minggu ini.",
      items: { type: Type.STRING },
    },
    suggestions: {
      type: Type.ARRAY,
      description: "Saran konkret agar pekan depan lebih produktif.",
      items: { type: Type.STRING },
    },
  },
  required: ["summary", "highlights", "suggestions"],
};

async function runAi(prompt: string, responseSchema: Schema): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AiUnavailableError("API key Gemini belum dikonfigurasi");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new AiUnavailableError("AI tidak mengembalikan jawaban");
    }
    return text;
  } catch (error) {
    throw toAiError(error);
  }
}

function toAiError(error: unknown): AiUnavailableError {
  if (error instanceof AiUnavailableError) return error;

  const status = (error as { status?: number })?.status;
  if (status === 429) {
    return new AiUnavailableError(
      "Kuota Gemini sedang penuh, coba beberapa saat lagi"
    );
  }
  if (status && status >= 500) {
    return new AiUnavailableError(
      "Layanan Gemini sedang bermasalah, coba lagi nanti"
    );
  }

  const message =
    error instanceof Error ? error.message : "Layanan AI tidak tersedia";
  return new AiUnavailableError(message);
}

function parseJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AiUnavailableError("Respons AI tidak dapat dipahami");
  }
}

export function sanitizeSubtasks(value: unknown): AiSubtask[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: AiSubtask[] = [];

  for (const item of value) {
    if (result.length >= 15) break;
    if (typeof item !== "object" || item === null) continue;

    const raw = item as Record<string, unknown>;
    const title =
      typeof raw.title === "string" ? raw.title.trim().slice(0, 160) : "";
    if (!title || seen.has(title.toLowerCase())) continue;

    const minutes = Number(raw.estimatedMinutes);
    const estimatedMinutes = Number.isFinite(minutes)
      ? Math.min(480, Math.max(5, Math.round(minutes)))
      : 30;

    seen.add(title.toLowerCase());
    result.push({ title, estimatedMinutes });
  }

  return result;
}

export function sanitizeInsight(value: unknown): WeeklyInsight {
  const fallback: WeeklyInsight = {
    summary: "",
    highlights: [],
    suggestions: [],
  };
  if (typeof value !== "object" || value === null) return fallback;

  const raw = value as Record<string, unknown>;
  const toStringArray = (items: unknown): string[] =>
    Array.isArray(items)
      ? items
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

  return {
    summary:
      typeof raw.summary === "string" ? raw.summary.trim() : fallback.summary,
    highlights: toStringArray(raw.highlights),
    suggestions: toStringArray(raw.suggestions),
  };
}

export async function generateSubtaskBreakdown(input: {
  title: string;
  description?: string | null;
  category?: string | null;
  existing: string[];
}): Promise<AiSubtask[]> {
  const existing = input.existing.length
    ? `Sub-task yang sudah ada (jangan duplikat):\n- ${input.existing.join("\n- ")}`
    : "Belum ada sub-task.";

  const prompt = [
    "Kamu adalah asisten perencana produktivitas.",
    "Pecahkan tugas besar berikut menjadi sub-task yang spesifik dan bisa dikerjakan langsung.",
    "",
    `Judul tugas: ${input.title}`,
    input.description ? `Deskripsi: ${input.description}` : null,
    input.category ? `Kategori: ${input.category}` : null,
    "",
    existing,
    "",
    "Aturan:",
    "- 3 sampai 8 sub-task",
    "- Judul singkat dan jelas, bahasa Indonesia",
    "- Berikan estimasi waktu realistik dalam menit (5–480)",
    "- Urutkan dari langkah yang paling masuk akal dikerjakan pertama",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const text = await runAi(prompt, SUBTASK_SCHEMA);
  return sanitizeSubtasks(parseJson(text));
}

export async function generateWeeklyInsight(
  stats: WeeklyStats,
  recentTitles: string[]
): Promise<WeeklyInsight> {
  const priorityText = Object.entries(stats.byPriority)
    .map(([key, value]) => `- ${key}: ${value} tugas`)
    .join("\n");
  const categoryText = Object.entries(stats.byCategory)
    .map(([key, value]) => `- ${key}: ${value} tugas`)
    .join("\n");
  const titlesText = recentTitles.length
    ? recentTitles.join(", ")
    : "tidak ada";

  const prompt = [
    "Kamu adalah asisten analis produktivitas.",
    "Buat insight mingguan terstruktur berdasarkan statistik berikut.",
    "",
    `Periode: ${stats.periodStart} sampai ${stats.periodEnd}`,
    `Tugas dibuat: ${stats.tasksCreated}`,
    `Tugas selesai: ${stats.tasksCompleted}`,
    `Tingkat penyelesaian: ${stats.completionRate}%`,
    `Tugas terlambat: ${stats.overdueCount}`,
    "",
    "Sebaran prioritas:",
    priorityText || "- tidak ada",
    "",
    "Sebaran kategori:",
    categoryText || "- tidak ada",
    "",
    `Beberapa tugas minggu ini: ${titlesText}`,
    "",
    "Aturan:",
    "- summary: 2-3 kalimat ringkas bahasa Indonesia",
    "- highlights: 2-4 poin pencapaian positif",
    "- suggestions: 2-4 saran konkret dan spesifik",
    "- Jangan mengarang angka; pakai data yang diberikan",
  ].join("\n");

  const text = await runAi(prompt, INSIGHT_SCHEMA);
  return sanitizeInsight(parseJson(text));
}
