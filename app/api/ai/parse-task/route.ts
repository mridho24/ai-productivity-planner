import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  AiUnavailableError,
  parseTaskFromText,
} from "@/lib/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Kamu belum masuk" }, { status: 401 });
  }

  let text: string;
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json(
      { error: "Tuliskan tugasmu terlebih dahulu" },
      { status: 400 }
    );
  }
  if (text.length > 1000) {
    return NextResponse.json(
      { error: "Kalimat terlalu panjang (maksimal 1000 karakter)" },
      { status: 400 }
    );
  }

  try {
    const parsed = await parseTaskFromText(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "AI tidak dapat memahami tugas, coba kalimat lain" },
        { status: 502 }
      );
    }
    return NextResponse.json({ task: parsed });
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("AI parse-task error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memahami tugas" },
      { status: 500 }
    );
  }
}
