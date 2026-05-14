"use client";

import { useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Video, Rocket } from "lucide-react";
import { ScheduleForm } from "./schedule-form";
import { AgreementConfirm } from "./agreement-confirm";
import {
  getNadzorSessionForChannel,
  type NadzorSessionWithAgreements,
} from "@/app/actions/nadzor";

export function NadzorPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { channel, client } = useChatContext();
  const [session, setSession] = useState<NadzorSessionWithAgreements | undefined>(undefined);

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
    return () => {
      cancelled = true;
    };
  }, [open, channelId, isNadzorPhase]);

  if (!open || !isNadzorPhase) return null;

  return (
    <div className="bg-background flex w-80 shrink-0 flex-col border-l">
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
  );
}
