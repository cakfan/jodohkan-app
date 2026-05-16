"use client";

import { useEffect, useState, useCallback } from "react";
import { useChatContext } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  declareNadzorReadiness,
  cancelNadzorReadiness,
  getNadzorReadinessStatus,
} from "@/app/actions/taaruf";

function formatCountdown(target: Date): string {
  const remaining = target.getTime() - Date.now();
  if (remaining <= 0) return "0 jam";
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}h`);
  if (hours > 0) parts.push(`${hours}j`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

export function ReadinessPanel() {
  const { channel } = useChatContext();
  const channelId = channel?.id ?? "";
  const requestId = channelId.replace("taaruf-", "");
  const phase = ((channel?.data as Record<string, unknown>)?.phase as string | undefined) ?? "chat";

  const [state, setState] = useState<{
    ikhwanReady: boolean;
    akhwatReady: boolean;
    timerEnd: string | null;
    isIkhwan: boolean | undefined;
    isAkhwat: boolean | undefined;
    ready: boolean;
    status?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!requestId) return;
    const result = await getNadzorReadinessStatus(requestId);
    if ("error" in result) return;
    setState(result as typeof state);
  }, [requestId]);

  useEffect(() => {
    if (!requestId || phase !== "chat") return;
    const id = setInterval(() => refresh(), 10_000);
    const initId = setTimeout(() => refresh(), 0);
    return () => {
      clearInterval(id);
      clearTimeout(initId);
    };
  }, [requestId, phase, refresh]);

  const handleDeclareReady = async () => {
    setLoading(true);
    const result = await declareNadzorReadiness(requestId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Anda menyatakan siap untuk nadzor.");
      refresh();
    }
    setLoading(false);
  };

  const handleCancelReady = async () => {
    setLoading(true);
    const result = await cancelNadzorReadiness(requestId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.info("Proses ta'aruf dihentikan.");
    }
    setLoading(false);
  };

  const isFrozen = channel?.data?.frozen === true;
  const dbStatus = state?.status;
  if (!requestId || phase !== "chat" || isFrozen || (dbStatus && dbStatus !== "accepted")) return null;

  const isReady = state?.ready ?? false;
  const ikhwanReady = state?.ikhwanReady ?? false;
  const akhwatReady = state?.akhwatReady ?? false;
  const isIkhwan = state?.isIkhwan ?? false;
  const isAkhwat = state?.isAkhwat ?? false;
  const selfReady = isIkhwan ? ikhwanReady : isAkhwat ? akhwatReady : false;
  const otherReady = isIkhwan ? akhwatReady : isAkhwat ? ikhwanReady : false;
  const timerEnd = state?.timerEnd ? new Date(state.timerEnd) : null;

  const showActions = state !== null && !isReady;

  return (
    <div className="bg-muted/30 border-muted flex w-full flex-wrap items-center gap-x-2 gap-y-1 border-b px-4 py-1.5 text-xs">
      <ShieldCheck className="text-muted-foreground size-3 shrink-0" />
      {state === null && (
        <span className="text-muted-foreground">Memeriksa kesiapan nadzor...</span>
      )}

      {state && isReady && (
        <>
          <CheckCircle className="size-3 text-emerald-500" />
          <span className="text-muted-foreground">
            Keduanya siap &mdash; menunggu mediator mengaktifkan nadzor
          </span>
        </>
      )}

      {state && !isReady && !selfReady && !otherReady && (
        <span className="text-muted-foreground">Kesiapan nadzor: Ikhwan ⏳ &middot; Akhwat ⏳</span>
      )}

      {state && !isReady && selfReady && !otherReady && (
        <span className="text-muted-foreground">
          Anda siap &mdash; menunggu pasangan
          {timerEnd && (
            <>
              &nbsp;(&nbsp;
              <Clock className="size-2.5" />
              {formatCountdown(timerEnd)}
              &nbsp;)
            </>
          )}
        </span>
      )}

      {state && !isReady && otherReady && !selfReady && (
        <>
          <Clock className="size-3 text-amber-500" />
          <span className="text-amber-600">
            Pasangan siap &mdash; Anda punya {timerEnd ? formatCountdown(timerEnd) : "7 hari"}
          </span>
        </>
      )}

      {showActions && !selfReady && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDeclareReady}
            disabled={loading}
            className="h-5 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
          >
            {loading ? "..." : "Siap"}
          </Button>
          {otherReady && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCancelReady}
              disabled={loading}
              className="h-5 px-2 text-[10px] text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
            >
              {loading ? "..." : "Tidak Siap"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
