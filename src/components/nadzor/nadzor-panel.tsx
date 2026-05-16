"use client";

import { useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { X, Heart, CheckCircle, XCircle, Video, Rocket, PhoneCall, Clock } from "lucide-react";
import { toast } from "sonner";
import { ScheduleForm } from "./schedule-form";
import { AgreementConfirm } from "./agreement-confirm";
import { VideoCallModal } from "./video-call-modal";
import {
  getNadzorSessionForChannel,
  submitNadzorDecision,
  submitNadzorFeedback,
  submitMediatorNotes,
  type NadzorSessionWithAgreements,
} from "@/app/actions/nadzor";
import { getProfile } from "@/app/actions/profile";

export function NadzorPanel({
  open,
  onClose,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  wide?: boolean;
}) {
  const { channel, client } = useChatContext();
  const [session, setSession] = useState<NadzorSessionWithAgreements | null | undefined>(undefined);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [isAkhwat, setIsAkhwat] = useState(false);

  const channelId = channel?.id ?? "";
  const phase = ((channel?.data as Record<string, unknown>)?.phase as string | undefined) ?? "chat";
  const isNadzorPhase = phase === "nadzor";

  const members = channel?.state?.members ? Object.values(channel.state.members) : [];
  const ownerId = channel?.data?.created_by_id ?? channel?.data?.created_by?.id;
  const owner = members.find(
    (m: { channel_role?: string; user?: { id?: string } }) =>
      m.channel_role === "owner" || m.user?.id === ownerId
  );
  const isMediator = owner?.user?.id === client?.userID;
  const currentUserId = client?.userID ?? "";

  const participantNames = Object.fromEntries(
    members.map((m: { user?: { id?: string; name?: string } }) => [
      m.user?.id ?? "",
      m.user?.name ?? m.user?.id ?? "",
    ])
  );

  const allAgreed = session?.agreements?.every((a) => a.agreed) ?? false;
  const sessionReady = session !== null && allAgreed;

  useEffect(() => {
    if (!open || !channelId || !isNadzorPhase) return;
    let cancelled = false;
    getNadzorSessionForChannel(channelId).then((result) => {
      if (cancelled) return;
      if ("session" in result && result.session) {
        setSession(result.session);
      } else {
        setSession(null);
      }
    });
    getProfile().then((result) => {
      if (cancelled) return;
      if ("data" in result && result.data) {
        setIsAkhwat(result.data.gender === "female");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, channelId, isNadzorPhase]);

  if (!open || !isNadzorPhase) return null;

  return (
    <>
      <div className={`bg-background flex ${wide ? "min-w-0 flex-1" : "w-80 shrink-0"} flex-col border-l`}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Video className="text-primary size-4" />
            <h3 className="text-sm font-semibold">Nadzor</h3>
            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 text-[10px]">
              Aktif
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground/50"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {session === undefined ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : session ? (
            session.status === "completed" || session.status === "terminated" ? (
              <AfterCallFormInline
                session={session}
                channelId={channelId}
                isMediator={isMediator}
                currentUserId={currentUserId}
                onRefresh={() => {
                  getNadzorSessionForChannel(channelId).then((result) => {
                    if ("session" in result && result.session) {
                      setSession(result.session);
                    } else {
                      setSession(null);
                    }
                  });
                }}
              />
            ) : (
              <div className="space-y-3">
                <AgreementConfirm
                  session={session}
                  currentUserId={currentUserId}
                  isMediator={isMediator}
                  onRefresh={() => {
                    getNadzorSessionForChannel(channelId).then((result) => {
                      if ("session" in result && result.session) {
                        setSession(result.session);
                      } else {
                        setSession(null);
                      }
                    });
                  }}
                />
                {sessionReady && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setVideoCallOpen(true)}
                  >
                    <PhoneCall className="size-4" />
                    Mulai Video Call
                  </Button>
                )}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <Rocket className="text-primary mx-auto mb-2 size-6" />
                <p className="text-xs leading-relaxed">
                  Fase nadzor sudah aktif. Ajukan jadwal untuk memulai sesi video call.
                </p>
              </div>
              <ScheduleForm channelId={channelId} />
            </div>
          )}
        </div>
      </div>

      {session && session.status !== "completed" && session.status !== "terminated" && (
        <VideoCallModal
          open={videoCallOpen}
          onOpenChange={setVideoCallOpen}
          sessionId={session.id}
          isMediator={isMediator}
          isAkhwat={isAkhwat}
          participantNames={participantNames}
        />
      )}
    </>
  );
}

function AfterCallFormInline({
  session,
  channelId,
  isMediator,
  currentUserId,
  onRefresh,
}: {
  session: NadzorSessionWithAgreements;
  channelId: string;
  isMediator: boolean;
  currentUserId: string;
  onRefresh: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [mediatorNotes, setMediatorNotes] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isIkhwan = currentUserId === session.senderId;
  const isAkhwat = currentUserId === session.recipientId;
  const myDecisionField = isIkhwan ? session.decisionIkhwan : isAkhwat ? session.decisionAkhwat : null;
  const otherDecisionField = isIkhwan ? session.decisionAkhwat : isAkhwat ? session.decisionIkhwan : null;
  const isParticipant = isIkhwan || isAkhwat;

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmittingFeedback(true);
    await submitNadzorFeedback(session.id, feedback);
    toast.success("Feedback berhasil dikirim.");
    setSubmittingFeedback(false);
  };

  const handleMediatorNotes = async () => {
    if (!mediatorNotes.trim()) return;
    await submitMediatorNotes(session.id, mediatorNotes);
    toast.success("Catatan mediator disimpan.");
  };

  const handleDecision = async (decision: "continue" | "stop") => {
    setActionLoading(true);
    const result = await submitNadzorDecision(session.id, channelId, decision);
    if (result.error) {
      toast.error(result.error);
    } else {
      if (result.outcome === "khitbah") {
        toast.success("Selamat! Ta'aruf lanjut ke tahap khitbah.");
      } else if (result.outcome === "stopped") {
        toast.success("Proses ta'aruf telah diakhiri.");
      } else {
        toast.success("Keputusan disimpan. Menunggu keputusan pihak lain.");
      }
      onRefresh();
    }
    setActionLoading(false);
  };

  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!session.decisionTimer) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [session.decisionTimer]);

  function formatDecisionTimer(target: Date): string {
    const remaining = target.getTime() - now;
    if (remaining <= 0) return "0 jam";
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((remaining % (60 * 1000)) / 1000);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}h`);
    if (hours > 0) parts.push(`${hours}j`);
    parts.push(`${mins}m`);
    parts.push(`${secs}d`);
    return parts.join(" ");
  }

  const decisionTimerDate = session.decisionTimer ? new Date(session.decisionTimer) : null;

  const renderDecisionStatus = () => {
    if (myDecisionField || otherDecisionField) {
      const bothContinue = session.decisionIkhwan === "continue" && session.decisionAkhwat === "continue";
      const eitherStop = session.decisionIkhwan === "stop" || session.decisionAkhwat === "stop";

      if (bothContinue) {
        return (
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <CheckCircle className="mx-auto mb-2 size-6 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Lanjut ke Khitbah</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Kedua pihak sepakat untuk melanjutkan ke tahap khitbah.
            </p>
          </div>
        );
      }

      if (eitherStop) {
        return (
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <XCircle className="mx-auto mb-2 size-6 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Proses Dihentikan</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Proses ta&apos;aruf telah dihentikan.
            </p>
          </div>
        );
      }
    }

    if (myDecisionField && !otherDecisionField) {
      return (
        <div className="bg-amber-500/10 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Menunggu Keputusan Pihak Lain</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Keputusan Anda sudah disimpan. Silakan tunggu keputusan dari pihak lainnya.
          </p>
          {decisionTimerDate && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
              <span>
                Sisa waktu: <strong>{formatDecisionTimer(decisionTimerDate)}</strong>
              </span>
            </div>
          )}
        </div>
      );
    }

    if (!myDecisionField && otherDecisionField) {
      return (
        <div className="bg-amber-500/10 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Keputusan Pasangan Diterima</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Pasangan Anda sudah memberikan keputusan. Silakan tentukan keputusan Anda.
          </p>
          {decisionTimerDate && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
              <span>
                Sisa waktu: <strong>{formatDecisionTimer(decisionTimerDate)}</strong>
              </span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-3 text-center">
        <Heart className="text-primary mx-auto mb-2 size-6" />
        <p className="text-sm font-medium">Sesi Nadzor Selesai</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Sesi video call telah berakhir. Silakan isi feedback dan tentukan langkah selanjutnya.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Feedback Anda</label>
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

      <div className="border-t pt-3">
        {isParticipant && !myDecisionField && !otherDecisionField && (
          <>
            <p className="mb-2 text-xs font-medium">Langkah Selanjutnya:</p>
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleDecision("continue")}
                disabled={actionLoading}
              >
                <CheckCircle className="size-4" />
                {actionLoading ? "Memproses..." : "Lanjut ke Khitbah"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleDecision("stop")}
                disabled={actionLoading}
              >
                <XCircle className="size-4" />
                {actionLoading ? "Memproses..." : "Stop"}
              </Button>
            </div>
          </>
        )}

        {isParticipant && (myDecisionField || otherDecisionField) && renderDecisionStatus()}

        {isMediator && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Keputusan peserta: {" "}
              {session.decisionIkhwan === "continue" ? "✅ Ikhwan setuju" : session.decisionIkhwan === "stop" ? "❌ Ikhwan stop" : "⏳ Ikhwan"}
              {", "}
              {session.decisionAkhwat === "continue" ? "✅ Akhwat setuju" : session.decisionAkhwat === "stop" ? "❌ Akhwat stop" : "⏳ Akhwat"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
