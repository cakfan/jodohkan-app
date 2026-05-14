"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  respondToScheduleProposal,
  confirmNadzorSchedule,
  cancelNadzorSession,
  type NadzorSessionWithAgreements,
} from "@/app/actions/nadzor";

function formatDateTime(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgreementConfirm({
  session,
  currentUserId,
  isMediator,
  onRefresh,
}: {
  session: NadzorSessionWithAgreements;
  currentUserId: string;
  isMediator: boolean;
  onRefresh: () => void;
}) {
  const [responding, setResponding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const myAgreement = session.agreements.find((a) => a.userId === currentUserId);
  const allAgreed = session.agreements.every((a) => a.agreed);
  const isRequester = session.requestedBy === currentUserId;
  const proposerIsMediator = session.requestedBy === session.mediatorId;

  const handleRespond = async (agree: boolean) => {
    setResponding(true);
    const result = await respondToScheduleProposal(session.id, agree);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(agree ? "Jadwal disetujui." : "Jadwal ditolak.");
      onRefresh();
    }
    setResponding(false);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    const result = await confirmNadzorSchedule(session.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Jadwal nadzor telah dikonfirmasi.");
      onRefresh();
    }
    setConfirming(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    const result = await cancelNadzorSession(session.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Jadwal dibatalkan.");
      onRefresh();
    }
    setCancelling(false);
  };

  return (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">Jadwal Diajukan</p>
        <p className="text-sm font-semibold">{formatDateTime(session.scheduledAt)}</p>
        <p className="text-muted-foreground text-[10px] mt-1">
          Durasi: {session.maxDurationMinutes} menit
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Status Persetujuan</p>
        {session.agreements.map((a) => {
          const isMe = a.userId === currentUserId;
          return (
            <div key={a.id} className="flex items-center gap-2">
              {a.agreed ? (
                <CheckCircle className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <Clock className="size-4 shrink-0 text-amber-500" />
              )}
              <span className="text-xs">
                {isMe ? "Anda" : "Pihak lainnya"}
                {a.agreed ? " — Menyetujui" : " — Menunggu"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {myAgreement && !myAgreement.agreed && !isMediator && (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => handleRespond(true)}
              disabled={responding}
            >
              {responding ? <Spinner /> : null}
              {responding ? "..." : "Setuju"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleRespond(false)}
              disabled={responding}
            >
              Tolak
            </Button>
          </div>
        )}

        {allAgreed && proposerIsMediator && (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 w-full justify-center py-1 text-xs">
            <CheckCircle className="size-3.5" />
            Jadwal telah dikonfirmasi
          </Badge>
        )}

        {allAgreed && !proposerIsMediator && isMediator && (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? <Spinner /> : null}
            {confirming ? "..." : "Konfirmasi Jadwal"}
          </Button>
        )}

        {allAgreed && !proposerIsMediator && !isMediator && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <Clock className="size-3.5" />
            Menunggu konfirmasi mediator
          </div>
        )}

        {(isRequester || isMediator) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Spinner /> : null}
            {cancelling ? "..." : "Batalkan Jadwal"}
          </Button>
        )}
      </div>
    </div>
  );
}
