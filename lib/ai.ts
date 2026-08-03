import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { Priority } from "@prisma/client";

const GEMINI_MODEL = "gemini-flash-latest";

const PRIORITY_VALUES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

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

export type PrioritySuggestion = {
  taskId: string;
  suggestedPriority: Priority;
  reasoning: string;
  focusScore: number;
};

export type TaskForPrioritization = {
  id: string;
  title: string;
  priority: Priority;
  category: string | null;
  dueDate: string | null;
  overdue: boolean;
};

export type ParsedSubtask = {
  title: string;
  estimatedMinutes: number | null;
};

export type ParsedTask = {
  title: string;
  description: string | null;
  category: string | null;
  priority: Priority;
  dueDate: string | null;
  subtasks: ParsedSubtask[];
};

const PRIORITY_SCHEMA: Schema = {
  type: Type.OBJECT,
  description: "Hasil analisis prioritas untuk daftar tugas.",
  properties: {
    suggestions: {
      type: Type.ARRAY,
      description: "Saran prioritas untuk setiap tugas.",
      items: {
        type: Type.OBJECT,
        properties: {
          taskId: { type: Type.STRING, description: "ID tugas yang dianalisis." },
          suggestedPriority: {
            type: Type.STRING,
            enum: PRIORITY_VALUES,
            description: "Prioritas yang disarankan.",
          },
          reasoning: {
            type: Type.STRING,
            description: "Alasan singkat dalam bahasa Indonesia.",
          },
          focusScore: {
            type: Type.INTEGER,
            description:
              "Skor fokus 0 sampai 100 (lebih tinggi = lebih penting dikerjakan).",
          },
        },
        required: ["taskId", "suggestedPriority", "reasoning", "focusScore"],
      },
    },
  },
  required: ["suggestions"],
};

const PARSE_TASK_SCHEMA: Schema = {
  type: Type.OBJECT,
  description: "Tugas terstruktur hasil terjemahan kalimat bebas.",
  properties: {
    title: { type: Type.STRING, description: "Judul singkat tugas." },
    description: { type: Type.STRING, description: "Deskripsi opsional." },
    category: { type: Type.STRING, description: "Kategori singkat opsional." },
    priority: {
      type: Type.STRING,
      enum: PRIORITY_VALUES,
      description: "Prioritas yang masuk akal.",
    },
    dueDate: {
      type: Type.STRING,
      description:
        "Tanggal jatuh tempo format YYYY-MM-DD (null jika tidak disebutkan).",
    },
    subtasks: {
      type: Type.ARRAY,
      description: "Langkah kecil opsional (maksimal 8).",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Judul sub-task." },
          estimatedMinutes: {
            type: Type.INTEGER,
            description: "Estimasi pengerjaan dalam menit (5-480).",
          },
        },
        required: ["title"],
      },
    },
  },
  required: ["title"],
};

export function sanitizePrioritySuggestions(
  value: unknown,
  validTaskIds: Set<string>
): PrioritySuggestion[] {
  if (typeof value !== "object" || value === null) return [];
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.suggestions)) return [];

  const seen = new Set<string>();
  const result: PrioritySuggestion[] = [];

  for (const item of raw.suggestions) {
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;

    const taskId = typeof entry.taskId === "string" ? entry.taskId : "";
    if (!taskId || !validTaskIds.has(taskId) || seen.has(taskId)) continue;

    const suggestedPriority = PRIORITY_VALUES.includes(
      entry.suggestedPriority as Priority
    )
      ? (entry.suggestedPriority as Priority)
      : "MEDIUM";
    const reasoning =
      typeof entry.reasoning === "string"
        ? entry.reasoning.trim().slice(0, 200)
        : "";
    const score = Number(entry.focusScore);
    const focusScore = Number.isFinite(score)
      ? Math.min(100, Math.max(0, Math.round(score)))
      : 50;

    seen.add(taskId);
    result.push({ taskId, suggestedPriority, reasoning, focusScore });
  }

  return result;
}

function isValidDateString(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function sanitizeParsedTask(value: unknown): ParsedTask | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 120) : "";
  if (!title) return null;

  const description =
    typeof raw.description === "string"
      ? raw.description.trim().slice(0, 2000) || null
      : null;
  const category =
    typeof raw.category === "string"
      ? raw.category.trim().slice(0, 60) || null
      : null;
  const priority = PRIORITY_VALUES.includes(raw.priority as Priority)
    ? (raw.priority as Priority)
    : "MEDIUM";

  const dueDate =
    typeof raw.dueDate === "string" && isValidDateString(raw.dueDate)
      ? raw.dueDate
      : null;

  const subtasks: ParsedSubtask[] = [];
  if (Array.isArray(raw.subtasks)) {
    for (const item of raw.subtasks) {
      if (subtasks.length >= 8) break;
      if (typeof item !== "object" || item === null) continue;
      const entry = item as Record<string, unknown>;
      const subtaskTitle =
        typeof entry.title === "string" ? entry.title.trim().slice(0, 160) : "";
      if (!subtaskTitle) continue;
      const minutes = Number(entry.estimatedMinutes);
      const estimatedMinutes = Number.isFinite(minutes)
        ? Math.min(480, Math.max(5, Math.round(minutes)))
        : null;
      subtasks.push({ title: subtaskTitle, estimatedMinutes });
    }
  }

  return { title, description, category, priority, dueDate, subtasks };
}

export async function generatePrioritySuggestions(
  tasks: TaskForPrioritization[]
): Promise<PrioritySuggestion[]> {
  const taskLines = tasks
    .map(
      (task) =>
        `- [${task.id}] "${task.title}" (prioritas sekarang: ${task.priority}${
          task.category ? `, kategori: ${task.category}` : ""
        }${task.dueDate ? `, tenggat: ${task.dueDate}` : ""}${
          task.overdue ? ", TERLAMBAT" : ""
        })`
    )
    .join("\n");

  const prompt = [
    "Kamu adalah asisten manajer prioritas tugas.",
    "Analisis daftar tugas aktif berikut dan beri saran prioritas serta skor fokus.",
    "",
    "Daftar tugas:",
    taskLines || "- tidak ada",
    "",
    "Aturan:",
    "- Setiap tugas WAJIB mendapat satu saran",
    "- suggestedPriority: LOW, MEDIUM, atau HIGH",
    "- focusScore 0-100: seberapa penting dikerjakan lebih dulu (tinggi = makin dulu)",
    "- Pertimbangkan tenggat (tugas terlambat harus tinggi), kategori, dan beban",
    "- reasoning: 1 kalimat alasan singkat dalam bahasa Indonesia",
  ].join("\n");

  const text = await runAi(prompt, PRIORITY_SCHEMA);
  const validIds = new Set(tasks.map((task) => task.id));
  return sanitizePrioritySuggestions(parseJson(text), validIds);
}

export async function parseTaskFromText(text: string): Promise<ParsedTask | null> {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
  const weekday = today.toLocaleDateString("id-ID", { weekday: "long" });

  const prompt = [
    "Kamu adalah asisten yang mengubah kalimat bebas menjadi data tugas terstruktur.",
    `Hari ini: ${weekday}, ${todayStr}.`,
    "",
    `Kalimat user: "${text}"`,
    "",
    "Aturan:",
    "- title: WAJIB, singkat dan jelas",
    "- Interpretasikan kata relatif seperti 'hari ini', 'besok', 'lusa' menjadi tanggal YYYY-MM-DD",
    "- priority: pilih LOW/MEDIUM/HIGH yang paling masuk akal",
    "- category: kategori singkat (misal Kerja, Pribadi, Belajar); null jika tidak jelas",
    "- subtasks: pecah jadi langkah kecil bila memungkinkan, maksimal 8",
    "- Jika kalimat tidak bermakna sebagai tugas, tetap beri title terbaik yang bisa disimpulkan",
  ].join("\n");

  const aiText = await runAi(prompt, PARSE_TASK_SCHEMA);
  return sanitizeParsedTask(parseJson(aiText));
}
