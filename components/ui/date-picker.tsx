"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DropdownNavProps, DropdownProps } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function handleDropdownChange(
  value: string | number,
  onChange: React.ChangeEventHandler<HTMLSelectElement>
) {
  const event = {
    target: { value: String(value) },
  } as React.ChangeEvent<HTMLSelectElement>;
  onChange(event);
}

function DropdownNav({ children }: DropdownNavProps) {
  return <div className="flex w-full items-center gap-2">{children}</div>;
}

function Dropdown(props: DropdownProps) {
  return (
    <Select
      value={String(props.value)}
      onValueChange={(value) => {
        if (props.onChange) {
          handleDropdownChange(value, props.onChange);
        }
      }}
    >
      <SelectTrigger className="h-8 w-fit font-medium first:grow">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
        {props.options?.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
}: {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8 w-full justify-start gap-2 rounded-lg pr-8 font-normal"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {value ? (
              <span>{format(value, "d MMMM yyyy", { locale: id })}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        {value ? (
          <button
            type="button"
            aria-label="Hapus tanggal"
            onClick={(event) => {
              event.preventDefault();
              onChange(null);
            }}
            className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => {
            onChange(date ?? null);
            setOpen(false);
          }}
          locale={id}
          captionLayout="dropdown"
          hideNavigation
          startMonth={new Date(today.getFullYear() - 1, 0)}
          endMonth={new Date(today.getFullYear() + 3, 11)}
          components={{ DropdownNav, Dropdown }}
          classNames={{ month_caption: "mx-0" }}
          className="rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}
