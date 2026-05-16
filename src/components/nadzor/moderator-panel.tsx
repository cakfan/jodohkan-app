"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MicOff,
  VideoOff,
  PhoneOff,
  VolumeX,
  MonitorOff,
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { logModeratorAction, endNadzorCall } from "@/app/actions/nadzor";

interface ModeratorPanelProps {
  nadzorSessionId: string;
  callId: string;
  participantNames?: Record<string, string>;
}

export function ModeratorPanel({
  nadzorSessionId,
  participantNames = {},
}: ModeratorPanelProps) {
  const call = useCall();
  const [mutingAudio, setMutingAudio] = useState<string | null>(null);
  const [mutingVideo, setMutingVideo] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  const participants = call?.state?.participants ?? [];

  const nonMediatorParticipants = participants.filter(
    (p) => p.userId !== call?.currentUserId
  );

  const handleMuteAudio = async (userId: string) => {
    setMutingAudio(userId);
    try {
      await call?.muteUser(userId, "audio");
      await logModeratorAction(nadzorSessionId, "mute_audio", {
        targetUserId: userId,
      });
    } catch {
      toast.error("Gagal memute audio peserta.");
    }
    setMutingAudio(null);
  };

  const handleMuteVideo = async (userId: string) => {
    setMutingVideo(userId);
    try {
      await call?.muteUser(userId, "video");
      await logModeratorAction(nadzorSessionId, "mute_video", {
        targetUserId: userId,
      });
    } catch {
      toast.error("Gagal mematikan video peserta.");
    }
    setMutingVideo(null);
  };

  const handleEndCall = async () => {
    setEnding(true);
    try {
      await call?.endCall();
      await endNadzorCall(nadzorSessionId, "completed");
      await logModeratorAction(nadzorSessionId, "end_call", {});
      toast.success("Sesi nadzor diakhiri.");
    } catch {
      toast.error("Gagal mengakhiri sesi.");
    }
    setEnding(false);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">
        Kontrol Moderator
      </h4>

      <div className="space-y-2">
        {nonMediatorParticipants.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Belum ada peserta dalam call.
          </p>
        ) : (
          nonMediatorParticipants.map((p) => (
            <div
              key={p.userId}
              className="bg-muted/50 flex items-center justify-between rounded-lg p-2"
            >
              <span className="truncate text-xs font-medium">
                {participantNames[p.userId] ?? p.userId.slice(0, 8)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleMuteAudio(p.userId)}
                  disabled={mutingAudio === p.userId}
                  title="Mute audio"
                >
                  {mutingAudio === p.userId ? (
                    <VolumeX className="size-3.5 text-destructive" />
                  ) : (
                    <MicOff className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleMuteVideo(p.userId)}
                  disabled={mutingVideo === p.userId}
                  title="Matikan video"
                >
                  {mutingVideo === p.userId ? (
                    <MonitorOff className="size-3.5 text-destructive" />
                  ) : (
                    <VideoOff className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={handleEndCall}
        disabled={ending}
      >
        <PhoneOff className="size-3.5" />
        {ending ? "Mengakhiri..." : "Akhiri Sesi"}
      </Button>
    </div>
  );
}
