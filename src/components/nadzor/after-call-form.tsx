"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  submitNadzorFeedback,
  submitMediatorNotes,
} from "@/app/actions/nadzor";

interface AfterCallFormProps {
  sessionId: string;
  isMediator: boolean;
  onDone: () => void;
}

export function AfterCallForm({
  sessionId,
  isMediator,
  onDone,
}: AfterCallFormProps) {
  const [feedback, setFeedback] = useState("");
  const [mediatorNotes, setMediatorNotes] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    if (feedback.trim()) {
      const result = await submitNadzorFeedback(sessionId, feedback);
      if (result.error) {
        toast.error(result.error);
        setSubmittingFeedback(false);
        return;
      }
      toast.success("Feedback berhasil dikirim.");
    }
    setSubmittingFeedback(false);
    onDone();
  };

  const handleMediatorNotes = async () => {
    if (!mediatorNotes.trim()) return;
    await submitMediatorNotes(sessionId, mediatorNotes);
    toast.success("Catatan mediator disimpan.");
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-3 text-center">
        <Heart className="text-primary mx-auto mb-2 size-6" />
        <p className="text-sm font-medium">Sesi Nadzor Selesai</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Terima kasih telah mengikuti sesi nadzor. Silakan isi feedback
          sebagai bahan evaluasi.
        </p>
      </div>

      {!isMediator && (
        <div className="space-y-2">
          <label className="text-xs font-medium">
            Feedback Anda (opsional)
          </label>
          <Textarea
            placeholder="Tulis kesan dan pesan Anda tentang sesi nadzor ini..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmitFeedback}
            disabled={submittingFeedback || !feedback.trim()}
            className="w-full"
          >
            {submittingFeedback ? <Spinner /> : null}
            {submittingFeedback ? "Mengirim..." : "Kirim Feedback"}
          </Button>
        </div>
      )}

      {isMediator && (
        <div className="space-y-2">
          <label className="text-xs font-medium">Catatan Mediator</label>
          <Textarea
            placeholder="Tulis catatan tentang sesi nadzor..."
            value={mediatorNotes}
            onChange={(e) => setMediatorNotes(e.target.value)}
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleMediatorNotes}
            disabled={!mediatorNotes.trim()}
            className="w-full"
          >
            Simpan Catatan
          </Button>
        </div>
      )}
    </div>
  );
}
