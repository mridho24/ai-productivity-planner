# AGENTS.md — AI Productivity Planner

File ini adalah aturan kerja untuk AI agent (OpenCode) di repo ini.
Baca dan patuhi seluruh isi file ini sebelum mengerjakan task apapun.

---

## 1. Ringkasan Proyek

Task manager berbasis web dengan bantuan AI untuk memecah tugas besar
menjadi sub-task + estimasi waktu, dan memberi ringkasan insight mingguan.

**Stack:**

- Frontend + API: Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- Database: Supabase (Postgres) via Prisma ORM
- Auth: NextAuth v5 (credentials/email, JWT + session)
- AI: Google Gemini free tier (gemini-2.0-flash)
- Charts: Recharts
- Deployment: Vercel (Hobby)
- CI: GitHub Actions (lint + test + typecheck)
- Testing: Vitest

**Data Model (Prisma):**

- `User` — id, email, passwordHash, name, createdAt
- `Task` — id, userId, title, description?, status (todo/in-progress/done),
  priority (low/medium/high), category, dueDate?, completedAt?, createdAt
- `Subtask` — id, taskId, title, estimatedMinutes?, done, createdAt

**Struktur repo:**

```
ai-productivity-planner/
├── app/
│   ├── (auth)/login, register
│   ├── (dashboard)/  → dashboard, tasks, insights
│   ├── api/          → api/tasks, api/tasks/[id], api/ai/breakdown, api/ai/insight
│   └── layout.tsx
├── components/       → UI, forms, charts
├── lib/              → prisma, ai (Gemini client), utils
├── prisma/           → schema, seed
├── tests/            → unit tests
├── .github/workflows/ → ci.yml
└── README.md
```

---

## 2. ATURAN GIT — WAJIB DIIKUTI

Ini adalah aturan paling penting di file ini.

1. **JANGAN PERNAH menjalankan `git commit` atau `git push`.**
   Agent tidak boleh mengeksekusi kedua perintah ini dalam kondisi apapun,
   bahkan jika diminta secara implisit oleh konteks task. Commit dan push
   hanya dilakukan manual oleh user.
2. Agent boleh menjalankan `git add`, `git status`, `git diff`, `git log`
   untuk keperluan review, tapi berhenti sebelum tahap commit.
3. Setiap kali menyelesaikan satu **section/task** (lihat daftar task di
   bagian 4), agent WAJIB memberikan **daftar commit yang disarankan**
   di akhir laporan pekerjaannya — bukan mengeksekusinya sendiri.
4. Format pesan commit yang disarankan:
   - Gunakan prefix conventional commit: `feat`, `fix`, `add`, `chore`,
     `refactor`, `test`, `docs`, `style`, `perf`.
   - Isi pesan setelah prefix **tepat 4 kata**, singkat dan jelas.
   - Format: `<prefix>: <kata1> <kata2> <kata3> <kata4>`
   - Contoh:
     - `feat: tambah autentikasi login register`
     - `add: buat skema database prisma`
     - `feat: implementasi AI breakdown task`
     - `fix: perbaiki validasi form login`
     - `chore: setup github actions ci`
     - `docs: tulis readme project lengkap`
5. Jika satu task menghasilkan beberapa perubahan logis berbeda, pecah
   menjadi beberapa commit yang disarankan, jangan digabung jadi satu.
6. Setelah agent menuliskan daftar commit yang disarankan, agent BERHENTI
   di situ — tidak menjalankan `git commit`, tidak menjalankan `git push`,
   dan tidak menganggap task selesai sampai user melakukan commit sendiri.

---

## 3. Prinsip Kerja Agent

- Selalu kerjakan task **per section/hari** sesuai roadmap di bagian 4,
  jangan meloncat ke task lain sebelum section berjalan selesai dan
  diverifikasi (build jalan, tidak ada error TypeScript).
- Setelah selesai satu section, agent memberi ringkasan singkat:
  1. Apa yang dikerjakan
  2. File yang dibuat/diubah
  3. Cara testing manual (jika relevan)
  4. Daftar commit message yang disarankan (lihat bagian 2)
- Gunakan TypeScript strict mode, hindari `any` kecuali benar-benar perlu.
- Semua environment variable (API key, DB URL, AUTH_SECRET, dll) HARUS
  lewat `.env.local` dan didaftarkan di `.env.example` — jangan pernah
  hardcode secret di kode.
- Integrasi Gemini API wajib punya fallback/error handling untuk kasus
  rate-limit, agar tidak membuat aplikasi crash.
- Supabase harus dikoneksikan lewat pooling URL (pgbouncer) yang
  disediakan Supabase, bukan direct connection.
- Tulis unit test (Vitest) untuk logika AI splitting dan helper function,
  bukan untuk UI components.
- Semua halaman harus responsive (mobile-friendly).

---

## 4. Roadmap Implementasi (Task Sections)

Kerjakan berurutan. Setiap section = satu kelompok commit yang disarankan.

1. **Hari 1–2 — Setup Awal**
   Init Next.js + Tailwind + shadcn, setup Prisma/Supabase, schema DB, seed data.
2. **Hari 3–4 — Auth**
   NextAuth v5 (register/login/logout), middleware proteksi route, hashing bcrypt.
3. **Hari 5–7 — Core CRUD & Dashboard**
   CRUD task lengkap, UI dashboard, chart Recharts, statistik completion rate.
4. **Hari 8–9 — AI Integration**
   Integrasi Gemini: AI breakdown task + weekly insight, fallback error rate-limit.
5. **Hari 10 — Polish**
   Responsive polish, error handling, loading states.
6. **Hari 11 — Deployment**
   Deploy ke Vercel, setup env var (API key, DB, AUTH_SECRET, NEXTAUTH_URL).
7. **Hari 12 — Dokumentasi & CI**
   README profesional (screenshot, live link, fitur), GitHub Actions CI, unit test.
8. **Hari 13–14 — Buffer**
   Nice-to-have: drag-and-drop status, dark mode, badge overdue.

---

## 5. Di Luar Scope

Jangan implementasikan hal berikut kecuali diminta eksplisit oleh user:

- Real-time collaboration
- Mobile app native
- Notifikasi email

---

## 6. Checklist Sebelum Melapor Task Selesai

- [ ] Build berhasil (`next build` tidak error)
- [ ] Tidak ada error TypeScript
- [ ] Tidak ada secret yang ter-hardcode
- [ ] File `.env.example` sudah update jika ada env var baru
- [ ] Daftar commit message (4 kata, prefix conventional) sudah ditulis
- [ ] TIDAK ada `git commit` / `git push` yang dijalankan oleh agent
