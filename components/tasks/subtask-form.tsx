"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { addSubtask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubtaskForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const result = await addSubtask(taskId, {
        title,
        estimatedMinutes: minutes ? Number(minutes) : null,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sub-task ditambahkan");
      setTitle("");
      setMinutes("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nama langkah kecil…"
        maxLength={160}
        className="flex-1"
      />
      <Input
        value={minutes}
        onChange={(event) => setMinutes(event.target.value)}
        placeholder="Menit (opsional)"
        type="number"
        min={1}
        max={1440}
        className="w-full sm:w-36"
      />
      <Button type="submit" disabled={pending || !title.trim()}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Tambah
      </Button>
    </form>
  );
}
