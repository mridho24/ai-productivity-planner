import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("demo1234", 12);

  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
      tasks: {
        create: [
          {
            title: "Belajar Next.js App Router",
            description: "Pahami konsep server components dan client components.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            category: "Belajar",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            subtasks: {
              create: [
                { title: "Baca dokumentasi layout dan page", estimatedMinutes: 45, done: true },
                { title: "Coba bikin route dinamis", estimatedMinutes: 60, done: false },
                { title: "Latihan server actions", estimatedMinutes: 90, done: false },
              ],
            },
          },
          {
            title: "Selesaikan integrasi Gemini API",
            description: "Sampeyan fitur AI breakdown task sampai bisa dipakai di UI.",
            status: "TODO",
            priority: "HIGH",
            category: "Proyek",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            title: "Olahraga 30 menit",
            status: "DONE",
            priority: "LOW",
            category: "Kesehatan",
            completedAt: new Date(),
          },
          {
            title: "Rapikan README proyek",
            description: "Tambahkan screenshot, link demo, dan penjelasan fitur.",
            status: "TODO",
            priority: "MEDIUM",
            category: "Proyek",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            subtasks: {
              create: [
                { title: "Ambil screenshot dashboard", estimatedMinutes: 20, done: false },
                { title: "Tulis section fitur dan stack", estimatedMinutes: 30, done: false },
              ],
            },
          },
          {
            title: "Belanja kebutuhan mingguan",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            category: "Rumah",
          },
        ],
      },
    },
  });

  console.log(`Seed selesai. User: ${user.email} (password: demo1234)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
