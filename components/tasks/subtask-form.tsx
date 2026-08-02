"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { addSubtask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EstimatedTimeFields } from "@/components/tasks/estimated-time-fields";

export function SubtaskForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    const hourValue = hours ? Number(hours) : 0;
    const minuteValue = minutes ? Number(minutes) : 0;

    if (hourValue > 24 || minuteValue > 59) {
      toast.error("Jam maksimal 24 dan menit maksimal 59");
      return;
    }

    const totalMinutes = hourValue * 60 + minuteValue;
    if (totalMinutes > 1440) {
      toast.error("Maksimal estimasi 24 jam");
      return;
    }

    startTransition(async () => {
      const result = await addSubtask(taskId, {
        title,
        estimatedMinutes: totalMinutes > 0 ? totalMinutes : null,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sub-task ditambahkan");
      setTitle("");
      setHours("");
      setMinutes("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nama langkah kecil…"
        maxLength={160}
        className="min-w-40 flex-1"
      />
      <EstimatedTimeFields
        hours={hours}
        minutes={minutes}
        onHoursChange={setHours}
        onMinutesChange={setMinutes}
      />
      <Button type="submit" disabled={pending || !title.trim()}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Tambah
      </Button>
    </form>
  );
}
