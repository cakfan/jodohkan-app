"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { proposeNadzorSchedule } from "@/app/actions/nadzor";

const MIN_DATE = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const MIN_HOUR = 9;
const MAX_HOUR = 15;

function isWithinAllowedHours(date: Date): boolean {
  const h = date.getHours();
  const m = date.getMinutes();
  return h >= MIN_HOUR && (h < MAX_HOUR || (h === MAX_HOUR && m === 0));
}

function formatHourRange(): string {
  return `${String(MIN_HOUR).padStart(2, "0")}:00 - ${String(MAX_HOUR).padStart(2, "0")}:00`;
}

export function ScheduleForm({ channelId }: { channelId: string }) {
  const [datetime, setDatetime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const minDate = MIN_DATE();
  const minStr = toLocalDateTimeString(minDate);

  const selectedDate = datetime ? new Date(datetime) : null;
  const timeValid = selectedDate ? isWithinAllowedHours(selectedDate) : true;

  const handleSubmit = async () => {
    if (!datetime || !selectedDate) return;
    if (!isWithinAllowedHours(selectedDate)) {
      toast.error(`Waktu harus antara ${formatHourRange()}.`);
      return;
    }
    setSubmitting(true);
    const result = await proposeNadzorSchedule(channelId, selectedDate);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Jadwal nadzor berhasil diajukan.");
      setDatetime("");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarClock className="text-primary size-4" />
        <span className="text-sm font-medium">Ajukan Jadwal Nadzor</span>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Pilih tanggal dan waktu yang diusulkan untuk sesi video call nadzor.
        Sesi akan berlangsung selama 30 menit.
      </p>
      <div className="space-y-2">
        <Label htmlFor="nadzor-datetime" className="text-xs">
          Tanggal & Waktu
        </Label>
        <Input
          id="nadzor-datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          min={minStr}
          className="w-full"
        />
        {selectedDate && !timeValid && (
          <p className="text-destructive text-[10px]">
            Waktu harus antara {formatHourRange()}.
          </p>
        )}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={submitting || !datetime || !timeValid}
        size="sm"
        className="w-full"
      >
        {submitting ? <Spinner /> : null}
        {submitting ? "Mengajukan..." : "Ajukan Jadwal"}
      </Button>
    </div>
  );
}
