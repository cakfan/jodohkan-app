"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";

export function WaliReminderDialog({
  open,
  onOpenChange,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
}) {
  const [checked, setChecked] = useState(false);

  const handleConfirm = () => {
    if (!checked) return;
    onConfirmed();
    setChecked(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Users className="text-primary size-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>Konfirmasi Wali</AlertDialogTitle>
          <AlertDialogDescription>
            Sebelum memasuki sesi video call nadzor, pastikan Anda telah
            didampingi oleh wali atau keluarga terpercaya yang hadir secara
            fisik di sisi Anda.
          </AlertDialogDescription>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
            <strong>Pengingat:</strong> Wali tidak perlu login ke aplikasi.
            Cukup hadir secara fisik untuk mendampingi jalannya sesi nadzor.
          </div>
        </AlertDialogHeader>
        <div className="flex items-start gap-3 px-6 pb-2">
          <Checkbox
            id="wali-check"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
          />
          <label
            htmlFor="wali-check"
            className="text-muted-foreground cursor-pointer text-xs leading-relaxed"
          >
            Saya sudah didampingi wali/keluarga terpercaya
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setChecked(false)}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!checked}>
            Masuk Video Call
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
