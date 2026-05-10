"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  HeartHandshake,
} from "lucide-react";
import {
  getMySentRequests,
  getMyIncomingRequests,
  respondToTaarufRequest,
} from "@/app/actions/taaruf";
import type { TaarufRequestData } from "@/app/actions/taaruf";

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: { label: "Menunggu", class: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800", icon: Clock },
  accepted: { label: "Diterima", class: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  declined: { label: "Ditolak", class: "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800", icon: XCircle },
  expired: { label: "Kadaluwarsa", class: "text-muted-foreground bg-muted/50 border-border", icon: AlertCircle },
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
  const expiresIn = Math.max(0, Math.floor((new Date(request.expiresAt).getTime() - now) / (1000 * 60 * 60)));
  const respondedAt = request.respondedAt
    ? new Date(request.respondedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-card border-border/50 hover:border-border/80 flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-colors">
      <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {getInitials(partnerName)}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/cv/${partnerUsername}`}
            className="font-semibold hover:underline"
          >
            {getInitials(partnerName)}
          </Link>
          {partnerUsername && (
            <span className="text-muted-foreground text-xs">@{partnerUsername}</span>
          )}
        </div>

        {request.message && (
          <p className="text-muted-foreground flex items-start gap-1.5 text-sm">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="italic">&ldquo;{request.message}&rdquo;</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Badge variant="outline" className={`gap-1.5 px-3 py-1 ${status.class}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
          {request.status === "pending" && !isExpired && (
            <span className="text-muted-foreground text-xs">{expiresIn} jam tersisa</span>
          )}
          {respondedAt && (
            <span className="text-muted-foreground text-xs">Direspon {respondedAt}</span>
          )}
        </div>
      </div>

      {isIncoming && request.status === "pending" && !isExpired && (
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => onRespond(request.id, "accept")}
            disabled={responding === request.id}
          >
            {responding === request.id ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Terima
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xl text-red-600 hover:text-red-700"
            onClick={() => onRespond(request.id, "decline")}
            disabled={responding === request.id}
          >
            <XCircle className="h-4 w-4" />
            Tolak
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
    <div className="bg-card border-border/50 flex flex-col items-center gap-5 rounded-2xl border p-12 text-center shadow-sm">
      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
        <Icon className="text-muted-foreground h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <Link href={action.href}>
          <Button variant="outline" className="rounded-xl">
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
    if (sentRes.data) setSent(sentRes.data);
    if (incomingRes.data) setIncoming(incomingRes.data);
    if (sentRes.error) setError(sentRes.error);
    if (incomingRes.error) setError(incomingRes.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRespond = useCallback(async (id: string, action: "accept" | "decline") => {
    setResponding(id);
    setError(null);
    const result = await respondToTaarufRequest(id, action);
    if (result.error) {
      setError(result.error);
    } else {
      await fetchData();
    }
    setResponding(null);
  }, [fetchData]);

  const pendingIncoming = incoming.filter((r) => r.status === "pending").length;
  const activeSent = sent.filter((r) => r.status === "pending" || r.status === "accepted").length;
  const acceptedCount = [...incoming, ...sent].filter((r) => r.status === "accepted").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-amber-50 dark:bg-amber-950/20 flex h-12 w-12 items-center justify-center rounded-xl">
              <Inbox className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Permintaan Masuk</p>
              <p className="text-2xl font-bold">{pendingIncoming}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 flex h-12 w-12 items-center justify-center rounded-xl">
              <HeartHandshake className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Riwayat</p>
              <p className="text-2xl font-bold">{activeSent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-blue-50 dark:bg-blue-950/20 flex h-12 w-12 items-center justify-center rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Diterima</p>
              <p className="text-2xl font-bold">{acceptedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle>Riwayat Permintaan</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incoming" className="gap-2">
                <Inbox className="h-4 w-4" />
                Diterima
                {pendingIncoming > 0 && (
                  <span className="bg-primary text-primary-foreground ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none">
                    {pendingIncoming}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2">
                <Send className="h-4 w-4" />
                Dikirim
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="mt-5 space-y-3">
              {incoming.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Belum ada permintaan"
                  description="Belum ada yang mengirimkan ta'aruf kepada Anda."
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

            <TabsContent value="sent" className="mt-5 space-y-3">
              {sent.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title="Belum ada permintaan"
                  description="Anda belum mengirimkan ta'aruf. Temukan kandidat di halaman Temukan."
                  action={{ label: "Cari Kandidat", href: "/temukan" }}
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
        </CardContent>
      </Card>
    </div>
  );
}
