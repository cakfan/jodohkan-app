"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  StreamCall,
  StreamVideo as SdkStreamVideo,
  StreamTheme,
  Call,
  CallingState,
  useCallStateHooks,
  useCall,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { useStreamVideo } from "@/components/stream-video-provider";
import { Button } from "@/components/ui/button";
import { X, Clock } from "lucide-react";
import { toast } from "sonner";
import { WaliReminderDialog } from "./wali-reminder-dialog";
import { WaliBanner } from "./wali-banner";
import { ModeratorPanel } from "./moderator-panel";
import { AfterCallForm } from "./after-call-form";
import { startNadzorCall } from "@/app/actions/nadzor";

function VideoCallUI({
  sessionId,
  isMediator,
  onCallEnded,
  participantNames,
}: {
  sessionId: string;
  isMediator: boolean;
  onCallEnded: () => void;
  participantNames?: Record<string, string>;
}) {
  const { useParticipants, useCallCallingState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();
  const call = useCall();

  const [showAfterCall, setShowAfterCall] = useState(false);
  const endedRef = useRef(false);

  useEffect(() => {
    if (!call) return;
    const handler = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      setShowAfterCall(true);
    };
    call.on("call.ended", handler);
    return () => {
      call.off("call.ended", handler);
    };
  }, [call]);

  const handleDone = () => {
    onCallEnded();
  };

  const isJoined = callingState === CallingState.JOINED;
  const isLoading = callingState === CallingState.JOINING;

  if (showAfterCall) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <AfterCallForm
            sessionId={sessionId}
            isMediator={isMediator}
            onDone={handleDone}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <WaliBanner />
      <div className="relative flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto p-4 md:grid-cols-2">
          {isLoading && (
            <div className="col-span-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Clock className="text-muted-foreground size-8 animate-pulse" />
                <p className="text-muted-foreground text-sm">
                  Menghubungkan...
                </p>
              </div>
            </div>
          )}
          {isJoined &&
            participants.map((p) => (
              <div
                key={p.sessionId}
                className="bg-muted relative aspect-video overflow-hidden rounded-lg"
              >
                <ParticipantView
                  participant={p}
                  key={p.sessionId}
                  ParticipantViewUI={null}
                />
                <div className="absolute bottom-2 left-2 rounded bg-background/50 px-2 py-0.5 text-[10px] text-foreground">
                  {p.userId?.slice(0, 8)}
                  {p.isSpeaking ? " 🎤" : ""}
                </div>
              </div>
            ))}
        </div>

        <div className="bg-background flex w-64 shrink-0 flex-col border-l p-4">
          {isMediator && (
            <ModeratorPanel
              nadzorSessionId={sessionId}
              callId={`nadzor-${sessionId}`}
              participantNames={participantNames}
            />
          )}

          {!isMediator && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground text-center text-xs">
                Anda sedang dalam sesi nadzor.
                <br />
                Mediator dapat memonitor dan mengontrol sesi ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoCallModal({
  open,
  onOpenChange,
  sessionId,
  isMediator,
  isAkhwat = true,
  participantNames = {},
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  isMediator: boolean;
  isAkhwat?: boolean;
  participantNames?: Record<string, string>;
}) {
  const { videoClient } = useStreamVideo();
  const [call, setCall] = useState<Call | null>(null);
  const [showWaliCheck, setShowWaliCheck] = useState(false);
  const callRef = useRef<Call | null>(null);

  useEffect(() => {
    if (!open || !videoClient) return;

    let cancelled = false;

    const init = async () => {
      const result = await startNadzorCall(sessionId);
      if (cancelled) return;

      if (result.error) {
        toast.error(result.error);
        onOpenChange(false);
        return;
      }

      const callId = `nadzor-${sessionId}`;
      const newCall = videoClient.call("nadzor", callId);

      try {
        await newCall.getOrCreate();

        if (!cancelled) {
          callRef.current = newCall;
          setCall(newCall);
          if (isAkhwat) {
            setShowWaliCheck(true);
          } else {
            await newCall.join();
            if (isMediator) {
              await newCall.camera.disable();
              await newCall.microphone.disable();
            }
          }
        }
      } catch {
        if (!cancelled) {
          toast.error("Gagal memulai sesi video call.");
          onOpenChange(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [open, videoClient, sessionId, onOpenChange, isAkhwat, isMediator]);

  const handleWaliConfirmed = useCallback(async () => {
    if (!callRef.current) return;
    try {
      await callRef.current.join();
      if (isMediator) {
        await callRef.current.camera.disable();
        await callRef.current.microphone.disable();
      }
      setShowWaliCheck(false);
    } catch {
      toast.error("Gagal bergabung ke sesi video call.");
    }
  }, [isMediator]);

  const handleClose = useCallback(async () => {
    if (callRef.current) {
      try {
        await callRef.current.leave();
      } catch {}
      callRef.current = null;
    }
    setCall(null);
    setShowWaliCheck(false);
    onOpenChange(false);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between bg-background/80 px-4 py-2">
        <span className="text-sm font-medium text-foreground">
          Sesi Nadzor
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClose}
          className="text-foreground/70 hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <>
        {call && (
            <SdkStreamVideo client={videoClient!}>
              <StreamCall call={call}>
                <StreamTheme as="div" className="flex-1 bg-background text-foreground">
                  <VideoCallUI
                    sessionId={sessionId}
                    isMediator={isMediator}
                    onCallEnded={handleClose}
                    participantNames={participantNames}
                  />
                </StreamTheme>
              </StreamCall>
            </SdkStreamVideo>
          )}

          {!call && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Clock className="text-muted-foreground size-10 animate-pulse" />
                <p className="text-muted-foreground text-sm">
                  Menyiapkan sesi video call...
                </p>
              </div>
            </div>
          )}
        </>

      <WaliReminderDialog
        open={showWaliCheck}
        onOpenChange={setShowWaliCheck}
        onConfirmed={handleWaliConfirmed}
      />
    </div>
  );
}
