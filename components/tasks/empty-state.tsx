"use client";

import { ListTodo, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  hasTasks,
  onAdd,
  message,
}: {
  hasTasks: boolean;
  onAdd: () => void;
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <ListTodo className="size-6" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold tracking-tight">
        {hasTasks ? "Tidak ada tugas yang cocok" : "Belum ada tugas"}
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {hasTasks
          ? "Coba ubah filter atau kata kunci pencarianmu."
          : message ??
            "Mulai dengan menulis satu rencana besar, lalu pecah jadi langkah kecil."}
      </p>
      {!hasTasks ? (
        <Button className="mt-5" onClick={onAdd}>
          <Plus />
          Buat tugas pertama
        </Button>
      ) : null}
    </div>
  );
}
