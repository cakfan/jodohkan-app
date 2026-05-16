"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import {
  getMySentRequests,
  getMyIncomingRequests,
  respondToTaarufRequest,
} from "@/app/actions/taaruf";
import type { TaarufRequestData } from "@/app/actions/taaruf";

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: {
    label: "Menunggu",
    class:
      "text-amber-700 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
    icon: Clock,
  },
  accepted: {
    label: "Diterima",
    class:
      "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50",
    icon: CheckCircle2,
  },
  declined: {
    label: "Ditolak",
    class: "text-red-700 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50",
    icon: XCircle,
  },
  expired: {
    label: "Kadaluwarsa",
    class: "text-muted-foreground bg-muted/60 border-border/60",
    icon: AlertCircle,
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function RequestCard({
  request,
  isIncoming,
  onRespond,
  responding,
}: {
  request: TaarufRequestData;
  isIncoming: boolean;
  onRespond: (id: string, action: "accept" | "decline") => void;
  responding: string | null;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const partnerName = isIncoming ? request.senderName : request.recipientName;
  const partnerUsername = isIncoming ? request.senderUsername : request.recipientUsername;
  const status = statusConfig[request.status] ?? statusConfig.expired;
  const StatusIcon = status.icon;
  const isExpired = request.status === "expired" || new Date(request.expiresAt).getTime() < now;
  const expiresIn = Math.max(
    0,
    Math.floor((new Date(request.expiresAt).getTime() - now) / (1000 * 60 * 60))
  );
  const respondedAt = request.respondedAt
    ? new Date(request.respondedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const isPending = request.status === "pending" && !isExpired;

  return (
    <div className="group border-border/40 bg-card hover:border-border/70 flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-sm">
      {/* Avatar */}
      <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {getInitials(partnerName)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            href={`/cv/${partnerUsername}`}
            className="leading-tight font-semibold hover:underline"
          >
            {getInitials(partnerName)}
          </Link>
          {partnerUsername && (
            <span className="text-muted-foreground text-xs">@{partnerUsername}</span>
          )}
        </div>

        {request.message && (
          <p className="text-muted-foreground flex items-start gap-1.5 text-sm">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="italic">&ldquo;{request.message}&rdquo;</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <Badge
            variant="outline"
            className={`gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.class}`}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          {isPending && (
            <span className="text-muted-foreground text-xs">{expiresIn} jam tersisa</span>
          )}
          {respondedAt && <span className="text-muted-foreground text-xs">{respondedAt}</span>}
        </div>
      </div>

      {/* Actions — only for incoming pending */}
      {isIncoming && isPending && (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/50 dark:hover:bg-red-950/30"
            onClick={() => onRespond(request.id, "decline")}
            disabled={responding === request.id}
          >
            <XCircle className="h-3.5 w-3.5" />
            Tolak
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-xl"
            onClick={() => onRespond(request.id, "accept")}
            disabled={responding === request.id}
          >
            {responding === request.id ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Terima
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon className="text-muted-foreground/60 h-7 w-7" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-[260px] text-sm leading-relaxed">{description}</p>
      </div>
      {action && (
        <Link href={action.href}>
          <Button variant="outline" size="sm" className="mt-1 rounded-xl">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

export function TaarufClient() {
  const [sent, setSent] = useState<TaarufRequestData[]>([]);
  const [incoming, setIncoming] = useState<TaarufRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("incoming");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [sentRes, incomingRes] = await Promise.all([
      getMySentRequests(),
      getMyIncomingRequests(),
    ]);
    if (sentRes.data)
      setSent(sentRes.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    if (incomingRes.data)
      setIncoming(incomingRes.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    if (sentRes.error) setError(sentRes.error);
    if (incomingRes.error) setError(incomingRes.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [sentRes, incomingRes] = await Promise.all([
        getMySentRequests(),
        getMyIncomingRequests(),
      ]);
      if (!mounted) return;
      if (sentRes.data)
        setSent(sentRes.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      if (incomingRes.data)
        setIncoming(incomingRes.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      if (sentRes.error) setError(sentRes.error);
      if (incomingRes.error) setError(incomingRes.error);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRespond = useCallback(
    async (id: string, action: "accept" | "decline") => {
      setResponding(id);
      setError(null);
      const result = await respondToTaarufRequest(id, action);
      if (result.error) {
        setError(result.error);
      } else {
        await fetchData();
      }
      setResponding(null);
    },
    [fetchData]
  );

  const pendingIncoming = incoming.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-muted-foreground h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-5 px-4 py-6 md:px-6">
      {error && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tab header */}
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-muted/60 h-9 rounded-xl p-1">
            <TabsTrigger
              value="incoming"
              className="gap-2 rounded-lg px-4 text-sm data-[state=active]:shadow-sm"
            >
              <Inbox className="h-3.5 w-3.5" />
              Masuk
              {pendingIncoming > 0 && (
                <span className="bg-primary text-primary-foreground inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold">
                  {pendingIncoming}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="gap-2 rounded-lg px-4 text-sm data-[state=active]:shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Terkirim
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Incoming tab */}
        <TabsContent value="incoming" className="mt-4 space-y-2.5">
          {incoming.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Belum ada permintaan masuk"
              description="Belum ada yang mengirimkan ta'aruf kepada Anda saat ini."
            />
          ) : (
            incoming.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                isIncoming
                onRespond={handleRespond}
                responding={responding}
              />
            ))
          )}
        </TabsContent>

        {/* Sent tab */}
        <TabsContent value="sent" className="mt-4 space-y-2.5">
          {sent.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Belum ada permintaan terkirim"
              description="Anda belum mengirimkan ta'aruf ke siapapun."
              action={{ label: "Temukan Kandidat", href: "/temukan" }}
            />
          ) : (
            sent.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                isIncoming={false}
                onRespond={handleRespond}
                responding={responding}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
